import {Repository, ResponseBody, ServiceResponse} from '../Class';
import {PullRequest as PullRequestTable, Repository as RepositoryTable, RepositoryRelated} from '../Database';
import {SERVER} from '../CONFIG';
import {promises as fsPromise} from 'fs';
import {spawn} from 'child_process';
import fse from 'fs-extra';
import {generateRepositoryPath} from '../Function/Repository';
import {cloneBareRepository, hasBranch, isMergeable as isMergeable1} from '../Git';
import {ILoggedInSession, ISession} from '../Interface';
import {hasReadAuthority} from '../RepositoryAuthorityCheck';

export async function create(repository: Readonly<Omit<Repository, 'username'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {name} = repository;
    // 检查是否有同名仓库
    if ((await RepositoryTable.count({username: usernameInSession, name})) !== 0)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `仓库 ${usernameInSession}/${name} 已存在`));
    }
    const repositoryPath = generateRepositoryPath({username: usernameInSession, name});

    // 尝试创建文件夹及 git 裸仓库，并创建数据库记录
    try
    {
        await fsPromise.mkdir(repositoryPath, {recursive: true});
        await (async () =>
        {
            return new Promise((resolve, reject) =>
            {
                const childProcess = spawn('git init --bare && cp hooks/post-update.sample hooks/post-update && git update-server-info && git config http.receivepack true', {
                    shell: true,
                    cwd: repositoryPath,
                });

                childProcess.on('exit', () =>
                {
                    resolve();
                });

                childProcess.on('error', err =>
                {
                    reject(err);
                });
            });
        })();
        // 如果文件创建步骤出错，数据库操作不会执行。如果数据库操作出错，数据库会自己回滚并抛出错误，文件也会被删除。因此总是安全的
        await RepositoryTable.insert({...repository, username: usernameInSession});
    }
    catch (e)   // 如果发生错误，删除文件夹及以下一切内容
    {
        await (async () =>
        {
            try
            {
                await fse.remove(repositoryPath);
            }
            catch (e)
            {
                SERVER.WARN_LOGGER(e);
                // 因为可能出现文件夹没被创建就失败的情况，因此删除抛出的错误不做处理
            }
        })();

        throw e;    // 把错误抛到外层
    }

    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function del(repository: Readonly<Pick<Repository, 'name'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {name} = repository;
    // 检查仓库是否存在
    if ((await RepositoryTable.count({username: usernameInSession, name})) === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${usernameInSession}/${name} 不存在`));
    }
    // [发起的拉取请求数量，自己发起到自己的拉取请求数量]
    const [pullRequestCount, selfPullRequestCount] = await Promise.all([
        PullRequestTable.count({
            sourceRepositoryUsername: usernameInSession,
            sourceRepositoryName: name,
        }),
        PullRequestTable.count({
            sourceRepositoryUsername: usernameInSession,
            sourceRepositoryName: name,
            targetRepositoryUsername: usernameInSession,
            targetRepositoryName: name,
        }),
    ]);
    if (pullRequestCount - selfPullRequestCount === 0)  // 没有发起到其他仓库的拉取请求，直接删除数据库删除文件
    {
        const backupName = `[backup]${name}_${Date.now()}`;
        const repositoryPath = generateRepositoryPath({username: usernameInSession, name});
        const backupRepositoryPath = generateRepositoryPath({username: usernameInSession, name: backupName});
        try
        {
            // 备份原仓库
            await fse.move(repositoryPath, backupRepositoryPath, {overwrite: true});
            await RepositoryTable.deleteByUsernameAndName({username: usernameInSession, name});
        }
        catch (e)   // 出现任何错误，恢复原仓库文件位置，数据库可以自己回滚
        {
            if (await fse.pathExists(backupRepositoryPath) && !(await fse.pathExists(repositoryPath)))  // 如果备份完全成功了再尝试移动回去
            {
                await fse.move(backupRepositoryPath, repositoryPath, {overwrite: true});
            }
            throw e;
        }
        // 没有发生错误，删除备份仓库
        await fse.remove(backupRepositoryPath);
    }
    else    // 有发起到其他仓库的拉取请求，标记删除
    {
        const deletedName = `[deleted]${name}_${Date.now()}`;
        const repositoryPath = generateRepositoryPath({username: usernameInSession, name});
        // 复制仓库到新地址
        const newRepositoryPath = generateRepositoryPath({username: usernameInSession, name: deletedName});
        await fse.copy(repositoryPath, newRepositoryPath);
        try
        {
            // 改名
            await RepositoryTable.update({name: deletedName}, {username: usernameInSession, name});
            try
            {
                // 在数据库中标记删除
                await RepositoryRelated.markRepositoryDeletedByUsernameAndName({
                    username: usernameInSession,
                    name: deletedName,
                });
            }
            catch (e)   // 标记删除失败了，把名字改回去
            {
                await RepositoryTable.update({name}, {username: usernameInSession, name: deletedName});
                throw e;    // 需要抛到外层
            }
        }
        catch (e)   // 数据库操作失败，删除复制的仓库
        {
            await fse.remove(newRepositoryPath);
            throw e;
        }
        // 数据库操作成功，删除原仓库
        await fse.remove(repositoryPath);
    }
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function getRepositories(start: number, end: number, username: Repository['username'] | undefined, usernameInSession: ISession['username']): Promise<ServiceResponse<Repository[]>>
{
    let repositories: Array<Repository>;
    if (username)
    {
        if (usernameInSession === undefined || usernameInSession !== username)
        {
            repositories = await RepositoryTable.select({isPublic: true, username}, start, end - start);
        }
        else
        {
            repositories = await RepositoryTable.select({username}, start, end - start);
        }
    }
    else
    {
        repositories = await RepositoryTable.select({isPublic: true}, start, end - start);
    }
    return new ServiceResponse<Array<Repository>>(200, {},
        new ResponseBody<Array<Repository>>(true, '', repositories));
}

export async function fork(sourceRepository: Pick<Repository, 'username' | 'name'>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {username, name} = sourceRepository;
    if (username === usernameInSession)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '不能 fork 自己的仓库'));
    }
    const sourceRepositoryInDatabase = await RepositoryTable.selectByUsernameAndName(sourceRepository);
    if (sourceRepositoryInDatabase === null || !await hasReadAuthority(sourceRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    if (!sourceRepositoryInDatabase.isPublic)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '不能 fork 私有仓库'));
    }
    const targetRepositoryInDatabase = await RepositoryTable.selectByUsernameAndName({
        username: usernameInSession,
        name,
    });
    if (targetRepositoryInDatabase !== null)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `已存在同名仓库 ${usernameInSession}/${name}`));
    }
    const sourceRepositoryPath = generateRepositoryPath(sourceRepository);
    const targetRepositoryPath = generateRepositoryPath({username: usernameInSession, name});
    try
    {
        await cloneBareRepository(sourceRepositoryPath, targetRepositoryPath);
        await RepositoryRelated.forkRepository(sourceRepository, {username: usernameInSession, name});
    }
    catch (e)
    {
        await fse.remove(targetRepositoryPath);
        throw e;
    }
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function isMergeable(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>, sourceRepositoryBranch: string, targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>, targetRepositoryBranch: string, usernameInSession: ILoggedInSession['username'] | undefined): Promise<ServiceResponse<{ isMergeable: boolean } | void>>
{
    // 检查两个仓库是否存在
    const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
    const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
    const [sourceRepositoryInDatabase, targetRepositoryInDatabase] = await Promise.all([
        RepositoryTable.selectByUsernameAndName({username: sourceRepositoryUsername, name: sourceRepositoryName}),
        RepositoryTable.selectByUsernameAndName({username: targetRepositoryUsername, name: targetRepositoryName}),
    ]);
    if (sourceRepositoryInDatabase === null
        || !await hasReadAuthority(sourceRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false,
                `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 不存在`));
    }
    if (targetRepositoryInDatabase === null
        || !await hasReadAuthority(targetRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false,
                `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 不存在`));
    }
    // 检查分支是否存在
    const sourceRepositoryPath = generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        hasBranch(targetRepositoryPath, targetRepositoryBranch),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false,
                `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranch} 不存在`));
    }
    if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false,
                `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranch} 不存在`));
    }
    // 查看是否可合并
    const isMergeable = await isMergeable1(sourceRepositoryPath, sourceRepositoryBranch, targetRepositoryPath, targetRepositoryBranch);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {isMergeable}));
}

export async function search(keyword: string, offset: number, limit: number): Promise<ServiceResponse<{ repositories: Repository[] }>>
{
    const repositories = await RepositoryTable.search(keyword, offset, limit, true);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {repositories}));
}