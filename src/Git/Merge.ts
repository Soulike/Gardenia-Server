import {Promisify, Repository} from '../Function';
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
            await Promisify.execPromise(`git merge --no-commit --no-ff origin/${sourceRepositoryBranch}`,
                {cwd: tempRepositoryPath});
        }
        else
        {
            const tempSourceRemoteName = `remote_${Date.now()}`;
            await addRemote(tempRepositoryPath, sourceRepositoryPath, tempSourceRemoteName);
            await Promisify.execPromise(`git merge --no-commit --no-ff ${tempSourceRemoteName}/${sourceRepositoryBranch}`,
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
export async function merge(sourceRepositoryUsername: string, sourceRepositoryName: string, sourceRepositoryBranch: string, targetRepositoryUsername: string, targetRepositoryName: string, targetRepositoryBranch: string, targetRepositoryUserEmail: string, message: string): Promise<void>
{
    const sourceRepositoryPath = Repository.generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = Repository.generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    let tempRepositoryPath = '';
    try
    {
        tempRepositoryPath = await makeTemporaryRepository(targetRepositoryPath, targetRepositoryBranch);
        await Promisify.execPromise(`git config user.name "${targetRepositoryUsername}" && git config user.email "${targetRepositoryUserEmail}"`,
            {cwd: tempRepositoryPath});
        // 判断是不是同一个仓库
        if (sourceRepositoryPath === targetRepositoryPath)
        {
            await Promisify.execPromise(`git merge --no-ff -m '${message}' origin/${sourceRepositoryBranch}`,
                {cwd: tempRepositoryPath});
        }
        else
        {
            const tempSourceRemoteName = `remote_${Date.now()}`;
            await addRemote(tempRepositoryPath, sourceRepositoryPath, tempSourceRemoteName);
            await Promisify.execPromise(`git merge --no-ff -m '${message}' ${tempSourceRemoteName}/${sourceRepositoryBranch}`,
                {cwd: tempRepositoryPath});
        }
        await Promisify.execPromise(`git push`, {cwd: tempRepositoryPath});
    }
    finally
    {
        if (tempRepositoryPath.length > 0)
        {
            await fse.remove(tempRepositoryPath);
        }
    }
}