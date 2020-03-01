import {Conflict, PullRequest} from '../Class';
import {execPromise} from '../Function/Promisify';
import {File, String} from '../Function';
import path from 'path';
import fs from 'fs';
import fse from 'fs-extra';
import {addRemote, makeTemporaryRepository} from './Tool';

/**
 * @description 获取合并冲突列表
 * */
export async function getConflicts(sourceRepositoryPath: string, sourceRepositoryBranch: string, targetRepositoryPath: string, targetRepositoryBranch: string): Promise<Conflict[]>
{
    let tempRepositoryPath = '';
    try
    {
        tempRepositoryPath = await makeTemporaryRepository(targetRepositoryPath, targetRepositoryBranch);
        const tempSourceRemoteName = `remote_${Date.now()}`;
        await addRemote(tempRepositoryPath, sourceRepositoryPath, tempSourceRemoteName);
        try
        {
            await execPromise(`git merge ${tempSourceRemoteName}/${sourceRepositoryBranch}`,
                {cwd: tempRepositoryPath});
        }
        catch (e)
        {
            // 忽略合并错误
        }
        const filePaths = String.splitToLines(
            await execPromise(`git ls-files -u | cut -f 2 | sort -u`, {cwd: tempRepositoryPath}));
        return await Promise.all(filePaths.map(async filePath =>
        {
            const fileAbsolutePath = path.join(tempRepositoryPath, filePath);
            if (await File.isBinaryFile(fileAbsolutePath))
            {
                return new Conflict(filePath, true, '');
            }
            const content = await fs.promises.readFile(fileAbsolutePath, {encoding: 'utf-8'});
            return new Conflict(filePath, false, content);
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
export async function resolveConflicts(repositoryPath: string, repositoryBranch: string, conflicts: Readonly<Conflict[]>, pullRequest: Readonly<Pick<PullRequest, 'no'>>): Promise<void>
{
    if (conflicts.length !== 0)
    {
        let tempRepositoryPath = '';
        try
        {
            tempRepositoryPath = await makeTemporaryRepository(repositoryPath, repositoryBranch);
            // 用修改后的文件内容覆盖原文件内容
            await Promise.all(conflicts.map(async ({filePath, content}) =>
                await fse.outputFile(path.join(tempRepositoryPath, filePath), content),
            ));
            // 暂存所有更改
            await Promise.all(conflicts.map(async ({filePath}) =>
                await execPromise(`git add ${filePath}`,
                    {cwd: tempRepositoryPath}),
            ));
            // 进行提交
            const {no} = pullRequest;
            await execPromise(`git commit -m '解决 Pull Request #${no} 的冲突'`,
                {cwd: tempRepositoryPath});
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
}