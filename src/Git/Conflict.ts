import {Conflict, PullRequest} from '../Class';
import {File, Promisify, Repository as RepositoryFunction, String} from '../Function';
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import {addRemote, makeTemporaryRepository} from './Tool';

/**
 * @description 获取合并冲突列表
 * */
export async function getConflicts(sourceRepositoryUsername: string, sourceRepositoryName: string, sourceRepositoryBranch: string, targetRepositoryUsername: string, targetRepositoryName: string, targetRepositoryBranch: string): Promise<Conflict[]>
{
    const sourceRepositoryPath = RepositoryFunction.generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = RepositoryFunction.generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    let tempRepositoryPath = '';
    try
    {
        tempRepositoryPath = await makeTemporaryRepository(sourceRepositoryPath, sourceRepositoryBranch);
        const tempRemoteName = `${targetRepositoryUsername}/${targetRepositoryName}`;
        await addRemote(tempRepositoryPath, targetRepositoryPath, tempRemoteName);
        try
        {
            await Promisify.execPromise(`git merge ${String.escapeLiteral(`${tempRemoteName}/${targetRepositoryBranch}`)}`,
                {cwd: tempRepositoryPath});
        }
        catch (e)
        {
            // 忽略合并错误
        }
        const filePaths = String.splitToLines(
            await Promisify.execPromise(`git ls-files -u | cut -f 2 | sort -u`, {cwd: tempRepositoryPath}));
        return await Promise.all(filePaths.map(async filePath =>
        {
            const fileAbsolutePath = path.join(tempRepositoryPath, filePath);
            if (await File.isBinaryFile(fileAbsolutePath))
            {
                return new Conflict(filePath, true, '');
            }
            const content = await fs.promises.readFile(fileAbsolutePath, {encoding: 'utf-8'});
            return new Conflict(filePath, false,
                content
                    .replace(/^>>>>>>> HEAD$/m, `>>>>>>> ${sourceRepositoryUsername}/${sourceRepositoryName}/${sourceRepositoryBranch}`)
                    .replace(/^<<<<<<< HEAD$/m, `<<<<<<< ${sourceRepositoryUsername}/${sourceRepositoryName}/${sourceRepositoryBranch}`));
        }));
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
 * @description 解决冲突，注意不能处理二进制文件
 * */
export async function resolveConflicts(sourceRepositoryUsername: string, sourceRepositoryName: string, sourceRepositoryBranch: string, sourceRepositoryUserEmail: string, targetRepositoryUsername: string, targetRepositoryName: string, targetRepositoryBranch: string, conflicts: Readonly<Conflict[]>, pullRequest: Readonly<Pick<PullRequest, 'no'>>): Promise<void>
{
    if (conflicts.length !== 0)
    {
        const sourceRepositoryPath = RepositoryFunction.generateRepositoryPath({
            username: sourceRepositoryUsername,
            name: sourceRepositoryName,
        });
        const targetRepositoryPath = RepositoryFunction.generateRepositoryPath({
            username: targetRepositoryUsername,
            name: targetRepositoryName,
        });
        let tempRepositoryPath = '';
        try
        {
            tempRepositoryPath = await makeTemporaryRepository(sourceRepositoryPath, sourceRepositoryBranch);
            const tempSourceRemoteName = `remote_${Date.now()}`;
            await addRemote(tempRepositoryPath, targetRepositoryPath, tempSourceRemoteName);
            try
            {
                await Promisify.execPromise(`git config user.name ${String.escapeLiteral(sourceRepositoryUsername)} && git config user.email ${String.escapeLiteral(sourceRepositoryUserEmail)}"`,
                    {cwd: tempRepositoryPath});
                await Promisify.execPromise(`git merge ${String.escapeLiteral(`${tempSourceRemoteName}/${targetRepositoryBranch}`)}`,
                    {cwd: tempRepositoryPath});
            }
            catch (e)
            {
                // 忽略合并错误
            }

            // 用修改后的文件内容覆盖原文件内容
            await Promise.all(conflicts.map(async ({filePath, content}) =>
                await fse.outputFile(path.join(tempRepositoryPath, filePath), content),
            ));
            // 进行提交
            const {no} = pullRequest;
            await Promisify.execPromise(`git commit -a -m '解决 Pull Request #${no} 的冲突'`,
                {cwd: tempRepositoryPath});
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
}