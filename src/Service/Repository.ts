import {Repository as RepositoryClass, ResponseBody, ServiceResponse} from '../Class';
import {Repository as RepositoryTable} from '../Database';
import {SERVER} from '../CONFIG';
import {promises as fsPromise} from 'fs';
import {spawn} from 'child_process';
import {Git, Session as SessionFunction} from '../Function';
import {Session} from 'koa-session';
import fse from 'fs-extra';

export async function create(repository: Readonly<Omit<RepositoryClass, 'username'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {name} = repository;
    const {username} = session;
    // 检查是否有同名仓库
    if ((await RepositoryTable.selectByUsernameAndName({username, name})) !== null)
    {
        return new ServiceResponse<void>(200, {}, new ResponseBody<void>(false, '仓库已存在'));
    }
    const repositoryPath = Git.generateRepositoryPath({username, name});

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
        await RepositoryTable.insert({...repository, username});
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

export async function del(repository: Readonly<Pick<RepositoryClass, 'name'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {username} = session;
    const {name} = repository;
    // 检查仓库是否存在
    if ((await RepositoryTable.selectByUsernameAndName({username, name})) === null)
    {
        return new ServiceResponse<void>(404, {}, new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = Git.generateRepositoryPath({username, name});
    /*
    * 删除采用以下步骤：
    * 1. 创建一个临时文件夹
    * 2. 将仓库文件夹移动到临时文件夹
    * 3. 删除数据库
    * 4. 删除临时文件夹中的仓库文件夹
    * 如果以上有任意一步失败都将仓库文件夹移动回原位。数据库出错可以自己回滚
    * */

    // 创建临时文件夹并移动仓库文件夹
    const tempPath = await fsPromise.mkdtemp('repo-');
    try
    {
        await fsPromise.rename(repositoryPath, tempPath);
    }
    catch (e)   // 如果这一步就失败了，就直接放弃操作
    {
        throw e;
    }

    // 文件夹移动成功，删除数据库记录
    try
    {
        await RepositoryTable.deleteByUsernameAndName({username, name});
    }
    catch (e)   // 数据库记录删除失败，把仓库文件夹移动回去
    {
        await fsPromise.rename(tempPath, repositoryPath);
        throw e;
    }
    // 数据库记录删除成功，删除临时文件夹
    await fse.remove(tempPath);

    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function getRepositories(start: number, end: number, session: Readonly<Session>, username?: RepositoryClass['username']): Promise<ServiceResponse<RepositoryClass[]>>
{
    let repositories: Array<RepositoryClass>;
    if (username)
    {
        if (!SessionFunction.isSessionValid(session) || !SessionFunction.isRequestedBySessionOwner(session, username))
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
    return new ServiceResponse<Array<RepositoryClass>>(200, {},
        new ResponseBody<Array<RepositoryClass>>(true, '', repositories));
}