import {Session} from 'koa-session';
import {Commit, Repository as RepositoryClass, ResponseBody, ServiceResponse} from '../Class';
import {Repository as RepositoryTable} from '../Database';
import {Git} from '../Function';
import path from 'path';
import {GIT} from '../CONFIG';

export namespace RepositoryInfo
{
    export async function repository(username: string, name: string, session: Session): Promise<ServiceResponse<RepositoryClass | null>>
    {
        if (username !== session.username)
        {
            return new ServiceResponse<null>(404, {},
                new ResponseBody<null>(false, '仓库不存在'));
        }

        const repository = await RepositoryTable.select(username, name);
        if (repository === null)
        {
            return new ServiceResponse<null>(404, {},
                new ResponseBody<null>(false, '仓库不存在'));
        }
        return new ServiceResponse<RepositoryClass>(200, {},
            new ResponseBody<RepositoryClass>(true, '', repository));
    }

    export async function branch(username: string, name: string, session: Session): Promise<ServiceResponse<Array<string> | null>>
    {
        if (username !== session.username)
        {
            return new ServiceResponse<null>(404, {},
                new ResponseBody<null>(false, '仓库不存在'));
        }

        if ((await RepositoryTable.select(username, name)) === null)
        {
            return new ServiceResponse<null>(404, {},
                new ResponseBody<null>(false, '仓库不存在'));
        }
        const repoPath = path.join(GIT.ROOT, username, `${name}.git`);
        const branches = await Git.getBranches(repoPath);
        return new ServiceResponse<Array<string>>(200, {},
            new ResponseBody<Array<string>>(true, '', branches));
    }

    export async function lastCommit(username: string, name: string, branch: string, session: Session): Promise<ServiceResponse<Commit | void>>
    {
        if (username !== session.username)
        {
            return new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, '仓库不存在'));
        }

        if ((await RepositoryTable.select(username, name)) === null)
        {
            return new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, '仓库不存在'));
        }
        const repoPath = path.join(GIT.ROOT, username, `${name}.git`);
        return new ServiceResponse<Commit>(200, {},
            new ResponseBody<Commit>(true, '', await Git.getLastCommitInfo(repoPath, branch)));
    }
}