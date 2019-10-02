import {Session} from 'koa-session';
import {Commit, Repository as RepositoryClass, ResponseBody, ServiceResponse} from '../Class';
import {Repository as RepositoryTable} from '../Database';
import {Git, Promisify} from '../Function';
import path from 'path';
import {GIT, SERVER} from '../CONFIG';
import {ObjectType} from '../CONSTANT';
import {ServerResponse} from 'http';
import {spawn} from 'child_process';

export async function repository(username: string, name: string, session: Session): Promise<ServiceResponse<RepositoryClass | void>>
{
    const repository = await RepositoryTable.select(username, name);
    if (repository === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const {isPublic} = repository;
    if (!isPublic && username !== session.username)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    return new ServiceResponse<RepositoryClass>(200, {},
        new ResponseBody<RepositoryClass>(true, '', repository));
}

export async function branch(username: string, name: string, session: Session): Promise<ServiceResponse<Array<string> | void>>
{
    const repository = await RepositoryTable.select(username, name);
    if (repository === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const {isPublic} = repository;
    if (!isPublic && username !== session.username)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repoPath = path.join(GIT.ROOT, username, `${name}.git`);
    const branches = await Git.getBranches(repoPath);
    return new ServiceResponse<Array<string>>(200, {},
        new ResponseBody<Array<string>>(true, '', branches));
}

export async function lastCommit(username: string, name: string, branch: string, session: Session, file?: string): Promise<ServiceResponse<Commit | void>>
{
    const repository = await RepositoryTable.select(username, name);
    if (repository === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const {isPublic} = repository;
    if (!isPublic && username !== session.username)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repoPath = path.join(GIT.ROOT, username, `${name}.git`);
    try
    {
        const commit = await Git.getLastCommitInfo(repoPath, branch, file);
        if (commit.commitHash.length === 0)  // 没有内容，文件不存在
        {
            return new ServiceResponse<Commit>(404, {},
                new ResponseBody<Commit>(false, '文件不存在'));
        }
        return new ServiceResponse<Commit>(200, {},
            new ResponseBody<Commit>(true, '', commit));
    }
    catch (e)   // 报错，是分支不存在
    {
        SERVER.WARN_LOGGER(e);
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支不存在'));
    }
}

export async function directory(username: string, name: string, branch: string, filePath: string, session: Session): Promise<ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }> | void>>
{
    const repository = await RepositoryTable.select(username, name);
    if (repository === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const {isPublic} = repository;
    if (!isPublic && username !== session.username)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repoPath = path.join(GIT.ROOT, username, `${name}.git`);
    try
    {
        const fileCommitInfoList = await Git.getFileCommitInfoList(repoPath, branch, filePath);
        if (fileCommitInfoList.length === 0)  // 信息列表是空的，一定是文件不存在
        {
            return new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, '文件不存在'));
        }

        return new ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }>>(
            200,
            {},
            new ResponseBody<Array<{ type: ObjectType, path: string, commit: Commit }>>(
                true,
                '',
                fileCommitInfoList,
            ),
        );
    }
    catch (e)   // 如果出错，那么一定是分支不存在
    {
        SERVER.WARN_LOGGER(e);
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支不存在'));
    }
}

export async function commitCount(username: string, name: string, branch: string, session: Session): Promise<ServiceResponse<{ commitCount: number } | void>>
{
    const repository = await RepositoryTable.select(username, name);
    if (repository === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const {isPublic} = repository;
    if (!isPublic && username !== session.username)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repoPath = path.join(GIT.ROOT, username, `${name}.git`);
    try
    {
        const commitCountString = await Promisify.execPromise(`git rev-list ${branch} --count`, {
            cwd: repoPath,
        }) as string;
        return new ServiceResponse<{ commitCount: number }>(200, {},
            new ResponseBody<{ commitCount: number }>(true, '', {
                commitCount: Number.parseInt(commitCountString),
            }));
    }
    catch (e)
    {
        if (branch.trim() === 'HEAD')
        {
            return new ServiceResponse<{ commitCount: number }>(200, {},
                new ResponseBody<{ commitCount: number }>(true, '', {
                    commitCount: 0,
                }));
        }
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支不存在'));
    }
}

export async function fileInfo(username: string, repositoryName: string, filePath: string, commitHash: string, session: Session): Promise<ServiceResponse<{ exists: boolean, type?: ObjectType, size?: number, isBinary?: boolean } | void>>
{
    const repository = await RepositoryTable.select(username, repositoryName);
    if (repository === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const {isPublic} = repository;
    if (!isPublic && username !== session.username)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repoPath = path.join(GIT.ROOT, username, `${repositoryName}.git`);
    let objectHash: string | null = null;
    let objectType: ObjectType | null = null;
    try
    {
        // 获取对象哈希和类型
        const result = await Promise.all([
            Git.getObjectHash(repoPath, filePath, commitHash),
            Git.getObjectType(repoPath, filePath, commitHash),
        ]);
        objectHash = result[0];
        objectType = result[1];
    }
    catch (e)   // 当提交 hash 不存在时会有 fatal: not a tree object
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '提交不存在'));
    }
    if (objectHash === null || objectType === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '文件不存在'));
    }

    // 把文件内容送给 file 命令行工具查看类型
    const fileOut = await Promisify.execPromise(`git cat-file -p ${objectHash} | file -`,
        {cwd: repoPath}) as string;
    if (fileOut.toLowerCase().includes('text')) // 当 file 工具的输出包含 "text" 时，是文本文件
    {
        // 获取文件大小
        const sizeString = await Promisify.execPromise(`git cat-file -s ${objectHash}`, {cwd: repoPath}) as string;
        const size = Number.parseInt(sizeString);
        return new ServiceResponse<{ exists: boolean, type?: ObjectType, size?: number, isBinary?: boolean }>(200, {},
            new ResponseBody<{ exists: boolean, type?: ObjectType, size?: number, isBinary?: boolean }>(
                true, '', {
                    exists: true, isBinary: false, type: objectType, size,
                },
            ));
    }
    else    // 是二进制文件
    {
        return new ServiceResponse<{ exists: boolean, type?: ObjectType, size?: number, isBinary?: boolean }>(200, {},
            new ResponseBody<{ exists: boolean, type?: ObjectType, size?: number, isBinary?: boolean }>(
                true, '', {
                    exists: true, isBinary: true,
                },
            ));
    }
}

export async function rawFile(username: string, repositoryName: string, filePath: string, commitHash: string, session: Session, res: ServerResponse): Promise<void>
{
    const repository = await RepositoryTable.select(username, repositoryName);
    if (repository === null)
    {
        res.statusCode = 404;
        return;
    }
    const {isPublic} = repository;
    if (!isPublic && username !== session.username)
    {
        res.statusCode = 404;
        return;
    }
    const repoPath = path.join(GIT.ROOT, username, `${repositoryName}.git`);
    let objectHash: string | null = null;
    try
    {
        // 获取对象哈希
        objectHash = await Git.getObjectHash(repoPath, filePath, commitHash);
    }
    catch (e)   // 当提交 hash 不存在时会有 fatal: not a tree object
    {
        res.statusCode = 404;
        return;
    }
    if (objectHash === null)
    {
        res.statusCode = 404;
        return;
    }
    // 执行命令获取文件内容
    const childProcess = spawn(`git cat-file -p ${objectHash}`, {cwd: repoPath, shell: true});
    res.statusCode = 200;
    childProcess.stdout.pipe(res);  // 用流的形式发出文件内容
    await Promisify.waitForEvent(childProcess, 'close');    // 等待传输结束
}