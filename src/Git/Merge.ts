import {execPromise} from '../Function/Promisify';
import fse from 'fs-extra';
import {addRemote, makeTemporaryRepository} from './Tool';

/**
 * @description 检测两个仓库是不是可以自动合并
 * */
export async function isMergeable(sourceRepositoryPath: string, sourceRepositoryBranch: string, targetRepositoryPath: string, targetRepositoryBranch: string): Promise<boolean>
{
    let tempRepositoryPath = '';
    try
    {
        tempRepositoryPath = await makeTemporaryRepository(targetRepositoryPath, targetRepositoryBranch);
        // 检测是不是同一个仓库
        if (sourceRepositoryPath === targetRepositoryPath)
        {
            await execPromise(`git merge --no-commit --no-ff origin/${sourceRepositoryBranch}`,
                {cwd: tempRepositoryPath});
        }
        else
        {
            const tempSourceRemoteName = `remote_${Date.now()}`;
            await addRemote(tempRepositoryPath, sourceRepositoryPath, tempSourceRemoteName);
            await execPromise(`git merge --no-commit --no-ff ${tempSourceRemoteName}/${sourceRepositoryBranch}`,
                {cwd: tempRepositoryPath});
        }
        return true;
    }
    catch (e)   // 命令会在不能自动合并时抛出错误
    {
        return false;
    }
    finally
    {
        if (tempRepositoryPath.length > 0)
        {
            await fse.remove(tempRepositoryPath);
        }
    }
}

/**
 * @description 合并仓库
 * */
export async function merge(sourceRepositoryPath: string, sourceRepositoryBranch: string, targetRepositoryPath: string, targetRepositoryBranch: string, message: string): Promise<void>
{
    let tempRepositoryPath = '';
    try
    {
        tempRepositoryPath = await makeTemporaryRepository(targetRepositoryPath, targetRepositoryBranch);
        // 判断是不是同一个仓库
        if (sourceRepositoryPath === targetRepositoryPath)
        {
            await execPromise(`git merge --no-ff -m '${message}' origin/${sourceRepositoryBranch}`,
                {cwd: tempRepositoryPath});
        }
        else
        {
            const tempSourceRemoteName = `remote_${Date.now()}`;
            await addRemote(tempRepositoryPath, sourceRepositoryPath, tempSourceRemoteName);
            await execPromise(`git merge --no-ff -m '${message}' ${tempSourceRemoteName}/${sourceRepositoryBranch}`,
                {cwd: tempRepositoryPath});
        }
        await execPromise(`git push`, {cwd: tempRepositoryPath});
    }
    finally
    {
        if (tempRepositoryPath.length > 0)
        {
            await fse.remove(tempRepositoryPath);
        }
    }
}