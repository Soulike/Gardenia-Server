import {Repository as RepositoryClass, ResponseBody, ServiceResponse} from '../Class';
import {Repository as RepositoryTable} from '../Database/Table';
import path from 'path';
import {GIT, SERVER} from '../CONFIG';
import {promises as fsPromise} from 'fs';
import {spawn} from 'child_process';

export namespace Repository
{
    export async function create(repository: RepositoryClass): Promise<ServiceResponse<void>>
    {
        const {username, name} = repository;
        // 检查是否有同名仓库
        if ((await RepositoryTable.select(username, name)) !== null)
        {
            return new ServiceResponse<void>(200, {}, new ResponseBody<void>(false, '仓库已存在'));
        }
        const repoPath = path.join(GIT.ROOT, username, `${name}.git`);

        // 尝试创建文件夹及 git 裸仓库，并创建数据库记录
        try
        {
            await fsPromise.mkdir(repoPath);
            await (async () =>
            {
                return new Promise((resolve, reject) =>
                {
                    const childProcess = spawn('git init --bare', {
                        shell: true,
                        cwd: repoPath,
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
            await RepositoryTable.insert(repository);
        }
        catch (e)   // 如果发生错误，删除文件夹及以下一切内容
        {
            await (async () =>
            {
                try
                {
                    return new Promise((resolve, reject) =>
                    {
                        // 截止到 Node 12，fs 中的文件夹递归删除仍然是实验性的，因此在此直接调用系统的 rm。为了跨平台考虑，可等 Api 稳定后后修改
                        const childProcess = spawn(`rm -rf ${repoPath}`, {
                            shell: true,
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
}