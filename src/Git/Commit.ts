import {Commit} from '../Class';
import {execPromise} from '../Function/Promisify';
import fse from 'fs-extra';
import {getBranches} from './Branch';
import {addRemote, makeTemporaryRepository} from './Tool';
import {String} from '../Function';

/**
 * @description 获取仓库的最后一次提交信息
 * */
export async function getLastCommit(repositoryPath: string): Promise<Commit>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const stdout = await execPromise(
        `git log --pretty=format:${String.escapeLiteral(`%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b`)} --all -1`,
        {cwd: repositoryPath});
    if (stdout.trim().length === 0)
    {
        throw new Error(`仓库提交不存在`);
    }
    const info = stdout.split(SEPARATOR);
    return new Commit(info[0], info[1], info[2], Number.parseInt(info[3]) * 1000, info[4], info[5]);
}

/**
 * @description 获取某个分支最后一次提交信息
 * */
export async function getBranchLastCommit(repositoryPath: string, branchName: string): Promise<Commit>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const stdout = await execPromise(
        `git log --pretty=format:${String.escapeLiteral(`%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b`)} -1 ${String.escapeLiteral(branchName)}`,
        {cwd: repositoryPath});
    if (stdout.trim().length === 0)
    {
        throw new Error(`仓库提交不存在`);
    }
    const info = stdout.split(SEPARATOR);
    return new Commit(info[0], info[1], info[2], Number.parseInt(info[3]) * 1000, info[4], info[5]);
}

/**
 * @description 获取某个分支某个文件最后一次提交信息
 * */
export async function getFileLastCommit(repositoryPath: string, branchName: string, filePath: string): Promise<Commit>
{
    const SEPARATOR = '|àωⓈ⒧|';
    if (filePath.length === 0)
    {
        filePath = '.';
    }
    const stdout = await execPromise(
        `git log --pretty=format:${String.escapeLiteral(`%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b`)} -1 ${String.escapeLiteral(branchName)} -- ${String.escapeLiteral(filePath)}`,
        {cwd: repositoryPath});
    if (stdout.trim().length === 0)
    {
        throw new Error(`仓库提交不存在`);
    }
    const info = stdout.split(SEPARATOR);
    return new Commit(info[0], info[1], info[2], Number.parseInt(info[3]) * 1000, info[4], info[5]);

}

/**
 * @description 获取到某个提交为止的提交次数
 * */
export async function getCommitCount(repositoryPath: string, commitHashOrBranchName: string): Promise<number>
{
    // 首先判断是否存在 master 分支，如果没有进行过任何提交是没有 master 分支的
    const branches = await getBranches(repositoryPath);
    if (branches.length === 0)
    {
        return 0;
    }
    // 以下命令会因为不存在 master 分支报错
    const stdout = await execPromise(`git rev-list ${String.escapeLiteral(commitHashOrBranchName)} --count`, {cwd: repositoryPath});
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
    const stdout = await execPromise(`git rev-list ${String.escapeLiteral(baseCommitHash)}..${String.escapeLiteral(targetCommitHash)} --count`, {cwd: repositoryPath});
    return Number.parseInt(stdout);
}

/**
 * @description 获取仓库两次提交之间的提交历史
 * */
export async function getRepositoryCommitsBetweenCommits(repositoryPath: string, baseCommitHashOrBranchName: string, targetCommitHashOrBranchName: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Commit[]>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const LOG_SEPARATOR = '|⑨⑨ⓂⓂ|';
    const stdout = await execPromise(
        `git log --pretty=format:${String.escapeLiteral(`%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b${LOG_SEPARATOR}`)} --skip=${offset} --max-count=${limit} ${String.escapeLiteral(baseCommitHashOrBranchName)}..${String.escapeLiteral(targetCommitHashOrBranchName)}`,
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
 * @description 获取仓库到 targetCommitHashOrBranchName 的提交历史
 * */
export async function getRepositoryCommits(repositoryPath: string, targetCommitHashOrBranchName: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Commit[]>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const LOG_SEPARATOR = '|⑨⑨ⓂⓂ|';
    const stdout = await execPromise(
        `git log --pretty=format:${String.escapeLiteral(`%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b${LOG_SEPARATOR}`)} --skip=${offset} --max-count=${limit} ${String.escapeLiteral(targetCommitHashOrBranchName)}`,
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
export async function getFileCommitsBetweenCommits(repositoryPath: string, filePath: string, baseCommitHashOrBranchName: string, targetCommitHashOrBranchName: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Commit[]>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const LOG_SEPARATOR = '|⑨⑨ⓂⓂ|';
    if (filePath.length === 0)
    {
        filePath = '.';
    }
    const stdout = await execPromise(
        `git log --pretty=format:${String.escapeLiteral(`%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b${LOG_SEPARATOR}`)} --skip=${offset} --max-count=${limit} ${String.escapeLiteral(baseCommitHashOrBranchName)}..${String.escapeLiteral(targetCommitHashOrBranchName)} -- ${String.escapeLiteral(filePath)}`,
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
 * @description 获取某个文件到 targetCommitHashOrBranchName 的提交历史
 * */
export async function getFileCommits(repositoryPath: string, filePath: string, targetCommitHashOrBranchName: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Commit[]>
{
    const SEPARATOR = '|àωⓈ⒧|';
    const LOG_SEPARATOR = '|⑨⑨ⓂⓂ|';
    if (filePath.length === 0)
    {
        filePath = '.';
    }
    const stdout = await execPromise(
        `git log --pretty=format:${String.escapeLiteral(`%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b${LOG_SEPARATOR}`)} --skip=${offset} --max-count=${limit} ${String.escapeLiteral(targetCommitHashOrBranchName)} -- ${String.escapeLiteral(filePath)}`,
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
        `git log --pretty=format:${String.escapeLiteral(`%H${SEPARATOR}%cn${SEPARATOR}%ce${SEPARATOR}%ct${SEPARATOR}%s${SEPARATOR}%b`)} -1 ${String.escapeLiteral(commitHash)}`,
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
export async function getCommitsBetweenForks(baseRepositoryPath: string, baseRepositoryBranchName: string, targetRepositoryPath: string, targetRepositoryBranchName: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Commit[]>
{
    // 先查看是不是同仓库，如果是同仓库不再进行克隆
    if (baseRepositoryPath === targetRepositoryPath)
    {
        return await getRepositoryCommitsBetweenCommits(baseRepositoryPath, baseRepositoryBranchName, targetRepositoryBranchName, offset, limit);
    }
    else
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
            return await getRepositoryCommitsBetweenCommits(tempRepositoryPath, baseRepositoryBranchName, `${tempSourceRemoteName}/${targetRepositoryBranchName}`, offset, limit);
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
    if (filePath.length === 0)
    {
        filePath = '.';
    }
    return (await execPromise(
        `git log --pretty=format:'%H' -- ${String.escapeLiteral(filePath)} | tail -1`
        , {cwd: repositoryPath})).trim();
}

/**
 * @description 获取最后一次提交的 hash
 * */
export async function getLastCommitHash(repositoryPath: string, branchName: string): Promise<string>
{
    return (await execPromise(
        `git log --pretty=format:'%H' ${String.escapeLiteral(branchName)} | head -1`
        , {cwd: repositoryPath})).trim();
}

/**
 * @description 获取某个文件最后一次提交的 hash
 * */
export async function getFileLastCommitHash(repositoryPath: string, filePath: string): Promise<string>
{
    if (filePath.length === 0)
    {
        filePath = '.';
    }
    return (await execPromise(
        `git log --pretty=format:'%H' -- ${String.escapeLiteral(filePath)} | tail -1`
        , {cwd: repositoryPath})).trim();
}

/**
 * @description 获取两仓库提交之间的提交历史
 * */
export async function getCommitsBetweenRepositoriesCommits(baseRepositoryPath: string, baseRepositoryCommitHash: string, targetRepositoryPath: string, targetRepositoryCommitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Commit[]>
{
    // 先查看是不是同一个仓库
    if (baseRepositoryPath === targetRepositoryPath)
    {
        return await getRepositoryCommitsBetweenCommits(baseRepositoryPath, baseRepositoryCommitHash, targetRepositoryCommitHash, offset, limit);
    }
    else
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
            return await getRepositoryCommitsBetweenCommits(tempRepositoryPath, baseRepositoryCommitHash, targetRepositoryCommitHash, offset, limit);
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

/**
 * @description 获取两仓库提交之间的提交次数
 * */
export async function getCommitCountBetweenRepositoriesCommits(baseRepositoryPath: string, baseRepositoryCommitHash: string, targetRepositoryPath: string, targetRepositoryCommitHash: string): Promise<number>
{
    // 先查看是不是同一个仓库
    if (baseRepositoryPath === targetRepositoryPath)
    {
        return await getCommitCountBetweenCommits(baseRepositoryPath, baseRepositoryCommitHash, targetRepositoryCommitHash);
    }
    else
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
}

/**
 * @description 获取两仓库分支之间的提交次数
 * */
export async function getCommitCountBetweenRepositoriesBranches(baseRepositoryPath: string, baseRepositoryBranchName: string, targetRepositoryPath: string, targetRepositoryBranchName: string): Promise<number>
{
    // 先查看是不是同一个仓库
    if (baseRepositoryPath === targetRepositoryPath)
    {
        return await getCommitCountBetweenCommits(baseRepositoryPath, baseRepositoryBranchName, targetRepositoryBranchName);
    }
    else
    {
        let tempRepositoryPath = '';
        try
        {
            // 复制源仓库
            tempRepositoryPath = await makeTemporaryRepository(baseRepositoryPath, baseRepositoryBranchName);
            // fetch 目标仓库
            const tempRemoteName = `remote_${Date.now()}`;
            await addRemote(tempRepositoryPath, targetRepositoryPath, tempRemoteName);
            // 得到历史
            return await getCommitCountBetweenCommits(tempRepositoryPath, baseRepositoryBranchName, `${tempRemoteName}/${targetRepositoryBranchName}`);
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