import {execPromise} from '../Function/Promisify';
import {splitToLines} from '../Function/String';
import {Branch} from '../Class';
import {getCommit} from './Commit';

/**
 * @description 获取所有分支信息
 * */
export async function getBranches(repositoryPath: string): Promise<Branch[]>
{
    const branchOutput = await execPromise(
        `git branch`
        , {cwd: repositoryPath});
    const branchLines = splitToLines(branchOutput);
    return await Promise.all(branchLines.map(async line =>
    {
        const sign = line.slice(0, 2);
        const branchName = line.slice(2);
        const commit = await getCommit(repositoryPath, branchName);
        return new Branch(branchName, commit, sign.includes('*'));
    }));
}

/**
 * @description 获取所有分支名
 * */
export async function getBranchNames(repositoryPath: string): Promise<string[]>
{
    const branchOutput = await execPromise(`git branch`, {cwd: repositoryPath});
    const branchLines = splitToLines(branchOutput);
    return branchLines.map(line => line.slice(2));
}

/**
 * @description 检查是否仓库有指定 branch
 * */
export async function hasBranch(repositoryPath: string, branchName: string): Promise<boolean>
{
    const branches = await getBranchNames(repositoryPath);
    return branches.includes(branchName);
}