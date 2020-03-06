import {Commit} from '../Class';
import {execPromise} from '../Function/Promisify';
import fse from 'fs-extra';
import {getBranches} from './Branch';
import {addRemote, makeTemporaryRepository} from './Tool';

/**
 * @description 获取某个分支最后一次提交信息
 * */
export async function getLastCommit(repositoryPath: string, branchName: string): Promise<Commit>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const stdout = await execPromise(
        `git log --pretty=format:'%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b' -1 ${branchName}`,
        {cwd: repositoryPath});
    const info = stdout.split(SEPARATOR);
    return new Commit(info[0], info[1], info[2], Number.parseInt(info[3]) * 1000, info[4], info[5]);
}

/**
 * @description 获取某个分支某个文件最后一次提交信息
 * */
export async function getFileLastCommit(repositoryPath: string, branchName: string, filePath: string): Promise<Commit>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const stdout = await execPromise(
        `git log --pretty=format:'%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b' -1 ${branchName} -- ${filePath}`,
        {cwd: repositoryPath});
    const info = stdout.split(SEPARATOR);
    return new Commit(info[0], info[1], info[2], Number.parseInt(info[3]) * 1000, info[4], info[5]);

}

/**
 * @description 获取到某个提交为止的提交次数
 * */
export async function getCommitCount(repositoryPath: string, commitHash: string): Promise<number>
{
    // 首先判断是否存在 master 分支，如果没有进行过任何提交是没有 master 分支的
    const branches = await getBranches(repositoryPath);
    if (branches.length === 0)
    {
        return 0;
    }
    // 以下命令会因为不存在 master 分支报错
    const stdout = await execPromise(`git rev-list ${commitHash} --count`, {cwd: repositoryPath});
    return Number.parseInt(stdout);
}

/**
 * @description 获取提交之间的提交次数
 * */
export async function getCommitCountBetweenCommits(repositoryPath: string, baseCommitHash: string, targetCommitHash: string): Promise<number>
{
    // 首先判断是否存在 master 分支，如果没有进行过任何提交是没有 master 分支的
    const branches = await getBranches(repositoryPath);
    if (branches.length === 0)
    {
        return 0;
    }
    // 以下命令会因为不存在 master 分支报错
    const stdout = await execPromise(`git rev-list ${baseCommitHash}..${targetCommitHash} --count`, {cwd: repositoryPath});
    return Number.parseInt(stdout);
}

/**
 * @description 获取仓库两次提交之间的提交历史
 * */
export async function getRepositoryCommitsBetweenCommits(repositoryPath: string, baseCommitHash: string, targetCommitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Commit[]>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const LOG_SEPARATOR = '|⑨⑨ⓂⓂ|';
    const stdout = await execPromise(
        `git log --pretty=format:'%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b${LOG_SEPARATOR}' --skip=${offset} --max-count=${limit} ${baseCommitHash}..${targetCommitHash}`,
        {cwd: repositoryPath});
    const logs = stdout.split(`${LOG_SEPARATOR}`).filter(line => line.length > 0);
    const commits: Commit[] = [];
    logs.forEach(line =>
    {
        const info = line.split(SEPARATOR);
        commits.push(new Commit(    // trim：删除上一行遗留的 \n
            info[0].trim(), info[1], info[2],
            Number.parseInt(info[3]) * 1000,
            info[4], info[5],
        ));
    });
    return commits;
}

/**
 * @description 获取仓库到 targetCommitHash 的提交历史
 * */
export async function getRepositoryCommits(repositoryPath: string, targetCommitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Commit[]>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const LOG_SEPARATOR = '|⑨⑨ⓂⓂ|';
    const stdout = await execPromise(
        `git log --pretty=format:'%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b${LOG_SEPARATOR}' --skip=${offset} --max-count=${limit} ${targetCommitHash}`,
        {cwd: repositoryPath});
    const logs = stdout.split(`${LOG_SEPARATOR}`).filter(line => line.length > 0);
    const commits: Commit[] = [];
    logs.forEach(line =>
    {
        const info = line.split(SEPARATOR);
        commits.push(new Commit(    // trim：删除上一行遗留的 \n
            info[0].trim(), info[1], info[2],
            Number.parseInt(info[3]) * 1000,
            info[4], info[5],
        ));
    });
    return commits;
}

/**
 * @description 获取某个文件两次提交之间的提交历史
 * */
export async function getFileCommitsBetweenCommits(repositoryPath: string, filePath: string, baseCommitHash: string, targetCommitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Commit[]>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const LOG_SEPARATOR = '|⑨⑨ⓂⓂ|';
    const stdout = await execPromise(
        `git log --pretty=format:'%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b${LOG_SEPARATOR}' --skip=${offset} --max-count=${limit} ${baseCommitHash}..${targetCommitHash} -- ${filePath}`,
        {cwd: repositoryPath});
    const logs = stdout.split(`${LOG_SEPARATOR}`).filter(line => line.length > 0);
    const commits: Commit[] = [];
    logs.forEach(line =>
    {
        const info = line.split(SEPARATOR);
        commits.push(new Commit(    // trim：删除上一行遗留的 \n
            info[0].trim(), info[1], info[2],
            Number.parseInt(info[3]) * 1000,
            info[4], info[5],
        ));
    });
    return commits;
}

/**
 * @description 获取某个文件到 targetCommitHash 的提交历史
 * */
export async function getFileCommits(repositoryPath: string, filePath: string, targetCommitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Commit[]>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const LOG_SEPARATOR = '|⑨⑨ⓂⓂ|';
    const stdout = await execPromise(
        `git log --pretty=format:'%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b${LOG_SEPARATOR}' --skip=${offset} --max-count=${limit} ${targetCommitHash} -- ${filePath}`,
        {cwd: repositoryPath});
    const logs = stdout.split(`${LOG_SEPARATOR}`).filter(line => line.length > 0);
    const commits: Commit[] = [];
    logs.forEach(line =>
    {
        const info = line.split(SEPARATOR);
        commits.push(new Commit(    // trim：删除上一行遗留的 \n
            info[0].trim(), info[1], info[2],
            Number.parseInt(info[3]) * 1000,
            info[4], info[5],
        ));
    });
    return commits;
}

/**
 * @description 获取某次提交的信息
 * */
export async function getCommit(repositoryPath: string, commitHash: string): Promise<Commit>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const stdout = await execPromise(
        `git log --pretty=format:'%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b' -1 ${commitHash}`,
        {cwd: repositoryPath});

    const [hash, committerName, committerEmail, commitTime, commitMessage, commitBody] = stdout.split(SEPARATOR);
    return new Commit(
        hash,
        committerName,
        committerEmail,
        Number.parseInt(commitTime) * 1000,
        commitMessage,
        commitBody);
}

/**
 * @description 获取两仓库分支之间的提交历史
 * */
export async function getCommitsBetweenForks(baseRepositoryPath: string, baseRepositoryBranchName: string, targetRepositoryPath: string, targetRepositoryBranchName: string): Promise<Commit[]>
{
    let tempRepositoryPath = '';
    try
    {
        // 复制源仓库
        tempRepositoryPath = await makeTemporaryRepository(baseRepositoryPath, baseRepositoryBranchName);
        // fetch 目标仓库
        const tempSourceRemoteName = `remote_${Date.now()}`;
        await addRemote(tempRepositoryPath, targetRepositoryPath, tempSourceRemoteName);
        // 得到源仓库分支到目标仓库分支的历史
        return await getRepositoryCommitsBetweenCommits(tempRepositoryPath, baseRepositoryBranchName, `${tempSourceRemoteName}/${targetRepositoryBranchName}`);
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
 * @description 获取第一次提交的 hash
 * */
export async function getFirstCommitHash(repositoryPath: string): Promise<string>
{
    return (await execPromise(
        `git log --pretty=format:'%H' | tail -1`
        , {cwd: repositoryPath})).trim();
}

/**
 * @description 获取某个文件第一次提交的 hash
 * */
export async function getFileFirstCommitHash(repositoryPath: string, filePath: string): Promise<string>
{
    return (await execPromise(
        `git log --pretty=format:'%H' -- ${filePath} | tail -1`
        , {cwd: repositoryPath})).trim();
}

/**
 * @description 获取最后一次提交的 hash
 * */
export async function getLastCommitHash(repositoryPath: string, branchName: string): Promise<string>
{
    return (await execPromise(
        `git log --pretty=format:'%H' ${branchName} | head -1`
        , {cwd: repositoryPath})).trim();
}

/**
 * @description 获取某个文件最后一次提交的 hash
 * */
export async function getFileLastCommitHash(repositoryPath: string, filePath: string): Promise<string>
{
    return (await execPromise(
        `git log --pretty=format:'%H' -- ${filePath} | tail -1`
        , {cwd: repositoryPath})).trim();
}

/**
 * @description 获取两仓库提交之间的提交历史
 * */
export async function getCommitsBetweenRepositoriesCommits(baseRepositoryPath: string, baseRepositoryCommitHash: string, targetRepositoryPath: string, targetRepositoryCommitHash: string): Promise<Commit[]>
{
    let tempRepositoryPath = '';
    try
    {
        // 复制源仓库
        tempRepositoryPath = await makeTemporaryRepository(baseRepositoryPath);
        // fetch 目标仓库
        const tempSourceRemoteName = `remote_${Date.now()}`;
        await addRemote(tempRepositoryPath, targetRepositoryPath, tempSourceRemoteName);
        // 得到历史
        return await getRepositoryCommitsBetweenCommits(tempRepositoryPath, baseRepositoryCommitHash, targetRepositoryCommitHash);
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
 * @description 获取两仓库提交之间的提交次数
 * */
export async function getCommitCountBetweenRepositoriesCommits(baseRepositoryPath: string, baseRepositoryCommitHash: string, targetRepositoryPath: string, targetRepositoryCommitHash: string): Promise<number>
{
    let tempRepositoryPath = '';
    try
    {
        // 复制源仓库
        tempRepositoryPath = await makeTemporaryRepository(baseRepositoryPath);
        // fetch 目标仓库
        const tempSourceRemoteName = `remote_${Date.now()}`;
        await addRemote(tempRepositoryPath, targetRepositoryPath, tempSourceRemoteName);
        // 得到历史
        return await getCommitCountBetweenCommits(tempRepositoryPath, baseRepositoryCommitHash, targetRepositoryCommitHash);
    }
    finally
    {
        if (tempRepositoryPath.length > 0)
        {
            await fse.remove(tempRepositoryPath);
        }
    }
}