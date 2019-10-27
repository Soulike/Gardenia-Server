import {Session} from 'koa-session';
import {Commit, Repository as RepositoryClass, ResponseBody, ServiceResponse} from '../Class';
import {Repository as RepositoryTable} from '../Database';
import {Git, Promisify} from '../Function';
import path from 'path';
import {GIT, SERVER} from '../CONFIG';
import {ObjectType} from '../CONSTANT';
import {ServerResponse} from 'http';
import {spawn} from 'child_process';
import mime from 'mime-types';
import fse from 'fs-extra';

export async function repository(username: string, repositoryName: string, session: Session | null): Promise<ServiceResponse<RepositoryClass | void>>
{
    const repository = await RepositoryTable.selectByUsernameAndName(username, repositoryName);
    if (!repositoryIsAvailableToTheViewer(repository, session))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    return new ServiceResponse<RepositoryClass>(200, {},
        new ResponseBody<RepositoryClass>(true, '', repository!));
}

export async function branch(username: string, repositoryName: string, session: Session | null): Promise<ServiceResponse<Array<string> | void>>
{
    const repository = await RepositoryTable.selectByUsernameAndName(username, repositoryName);
    if (!repositoryIsAvailableToTheViewer(repository, session))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repoPath = path.join(GIT.ROOT, username, `${repositoryName}.git`);
    const branches = await Git.getBranches(repoPath);
    return new ServiceResponse<Array<string>>(200, {},
        new ResponseBody<Array<string>>(true, '', branches));
}

export async function lastCommit(username: string, repositoryName: string, commitHash: string, session: Session | null, filePath?: string): Promise<ServiceResponse<Commit | void>>
{
    const repository = await RepositoryTable.selectByUsernameAndName(username, repositoryName);
    if (!repositoryIsAvailableToTheViewer(repository, session))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repoPath = path.join(GIT.ROOT, username, `${repositoryName}.git`);
    try
    {
        const commit = await Git.getLastCommitInfo(repoPath, commitHash, filePath);
        return new ServiceResponse<Commit>(200, {},
            new ResponseBody<Commit>(true, '', commit));
    }
    catch (e)
    {
        SERVER.WARN_LOGGER(e);
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支或文件不存在'));
    }
}

export async function directory(username: string, repositoryName: string, commitHash: string, directoryPath: string, session: Session | null): Promise<ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }> | void>>
{
    const repository = await RepositoryTable.selectByUsernameAndName(username, repositoryName);
    if (!repositoryIsAvailableToTheViewer(repository, session))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repoPath = path.join(GIT.ROOT, username, `${repositoryName}.git`);
    try
    {
        const fileCommitInfoList = await Git.getFileCommitInfoList(repoPath, commitHash, directoryPath);
        if (fileCommitInfoList.length === 0)  // 信息列表是空的，一定是文件不存在
        {
            return new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, '文件不存在'));
        }

        // 对获取的数组进行排序，类型为 TREE 的在前，BLOB 的在后
        fileCommitInfoList.sort((fileCommitInfoA, fileCommitInfoB) =>
        {
            const {type: AType, path: APath} = fileCommitInfoA;
            const {type: BType, path: BPath} = fileCommitInfoB;
            if (AType === ObjectType.TREE)
            {
                if (BType === ObjectType.TREE)   // 类型相同，就按照名称排序
                {
                    return path.basename(APath) > path.basename(BPath) ? 1 : 0;
                }
                else // BType === ObjectType.BLOB
                {
                    return -1;
                }
            }
            else    // AType === ObjectType.BLOB
            {
                if (BType === ObjectType.TREE)
                {
                    return 1;
                }
                else // BType === ObjectType.BLOB 类型相同，就按照名称排序
                {
                    return path.basename(APath) > path.basename(BPath) ? 1 : 0;
                }
            }
        });

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

export async function commitCount(username: string, name: string, commitHash: string, session: Session | null): Promise<ServiceResponse<{ commitCount: number } | void>>
{
    const repository = await RepositoryTable.selectByUsernameAndName(username, name);
    if (!repositoryIsAvailableToTheViewer(repository, session))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repoPath = path.join(GIT.ROOT, username, `${name}.git`);
    try
    {
        const commitCountString = await Promisify.execPromise(`git rev-list ${commitHash} --count`, {
            cwd: repoPath,
        }) as string;
        return new ServiceResponse<{ commitCount: number }>(200, {},
            new ResponseBody<{ commitCount: number }>(true, '', {
                commitCount: Number.parseInt(commitCountString),
            }));
    }
    catch (e)
    {
        if (commitHash.trim() === 'HEAD')
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

export async function fileInfo(username: string, repositoryName: string, filePath: string, commitHash: string, session: Session | null): Promise<ServiceResponse<{ exists: boolean, type?: ObjectType, size?: number, isBinary?: boolean } | void>>
{
    const repository = await RepositoryTable.selectByUsernameAndName(username, repositoryName);
    if (!repositoryIsAvailableToTheViewer(repository, session))
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
    catch (e)
    {
        return new ServiceResponse<{ exists: boolean, type?: ObjectType, size?: number, isBinary?: boolean }>(200, {},
            new ResponseBody<{ exists: boolean, type?: ObjectType, size?: number, isBinary?: boolean }>(true, '', {exists: false}));
    }

    // 把文件内容送给 file 命令行工具查看类型
    const fileOut = (await Promisify.execPromise(`git cat-file -p ${objectHash} | file -`,
        {cwd: repoPath}) as string).toLowerCase();
    if (fileOut.includes('text') || fileOut.includes('json')) // 当 file 工具的输出包含 "text" 或 "json" 时，是文本文件
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

export async function rawFile(username: string, repositoryName: string, filePath: string, commitHash: string, session: Session | null, res: ServerResponse): Promise<void>
{
    const repository = await RepositoryTable.selectByUsernameAndName(username, repositoryName);
    if (!repositoryIsAvailableToTheViewer(repository, session))
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
    // 执行命令获取文件内容
    const childProcess = spawn(`git cat-file -p ${objectHash}`, {cwd: repoPath, shell: true});
    res.statusCode = 200;
    res.setHeader('Content-Type', mime.contentType(filePath) || 'application/octet-stream');
    childProcess.stdout.pipe(res);  // 用流的形式发出文件内容
    await Promisify.waitForEvent(childProcess, 'close');    // 等待传输结束
}

export async function setName(username: string, repositoryName: string, newRepositoryName: string): Promise<ServiceResponse<void>>
{
    if ((await RepositoryTable.selectByUsernameAndName(username, newRepositoryName)) !== null)
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '仓库名已存在'));
    }

    const repository = await RepositoryTable.selectByUsernameAndName(username, repositoryName);
    if (!repositoryIsAvailableToTheViewer(repository))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }

    const repoPath = path.join(GIT.ROOT, username, `${repositoryName}.git`);
    const newRepoPath = path.join(GIT.ROOT, username, `${newRepositoryName}.git`);
    try
    {
        await fse.copy(repoPath, newRepoPath, {
            overwrite: false,
            errorOnExist: true,
            preserveTimestamps: true,
        });
    }
    catch (e)
    {
        await fse.remove(newRepoPath);
        throw e;
    }

    try
    {
        const {username, name} = repository!;
        repository!.name = newRepositoryName;
        await RepositoryTable.update(repository!, {username, name});
    }
    catch (e)
    {
        await fse.remove(newRepoPath);
        throw e;
    }
    await fse.remove(repoPath);
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function setDescription(username: string, repositoryName: string, description: string): Promise<ServiceResponse<void>>
{
    const repository = await RepositoryTable.selectByUsernameAndName(username, repositoryName);
    if (!repositoryIsAvailableToTheViewer(repository))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    repository!.description = description;
    await RepositoryTable.update(repository!);
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

/**
 * @description 检查访问者是否有权限访问某仓库
 * @param repository - 被访问的仓库
 * @param session - 访问者的 Session 对象，若不传入则仅检查仓库是否存在
 * */
function repositoryIsAvailableToTheViewer(repository: RepositoryClass | null, session?: Session | null): boolean
{
    let isAvailable = false;
    if (repository === null)
    {
        isAvailable = false;
    }
    else    // repository !== null
    {
        const {isPublic} = repository;
        if (isPublic)
        {
            isAvailable = true;
        }
        else if (session === null || session === undefined)    // !isPublic
        {
            isAvailable = false;
        }
        else    // !isPublic && session !== null && session !== undefined
        {
            const {username} = repository;
            const {username: usernameInSession} = session;
            isAvailable = username === usernameInSession;
        }
    }
    return isAvailable;
}