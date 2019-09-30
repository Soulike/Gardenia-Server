import {Session} from 'koa-session';
import {Commit, Repository as RepositoryClass, ResponseBody, ServiceResponse} from '../Class';
import {Repository as RepositoryTable} from '../Database';
import {Git, Promisify} from '../Function';
import path from 'path';
import {GIT, SERVER} from '../CONFIG';
import {ObjectType} from '../CONSTANT';

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
        return new ServiceResponse<Commit>(200, {},
            new ResponseBody<Commit>(true, '', await Git.getLastCommitInfo(repoPath, branch, file)));
    }
    catch (e)
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
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支不存在'));
    }
}