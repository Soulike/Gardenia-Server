import {BlockDiff, FileDiff} from '../Class';
import {getFirstCommitHash} from './Commit';
import fse from 'fs-extra';
import {EMPTY_TREE_HASH, REGEX} from '../CONSTANT';
import {execPromise} from '../Function/Promisify';
import {addRemote, getCommonAncestor, makeTemporaryRepository} from './Tool';

/**
 * @description 获取两次提交之间被修改的文件（累计修改，即公共祖先到 target 的修改
 * */
export async function getChangedFilesBetweenCommits(repositoryPath: string, baseCommitHashOrBranchName: string, targetCommitHashOrBranchName: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<string[]>
{
    const ancestorHash = await getCommonAncestor(repositoryPath, baseCommitHashOrBranchName, targetCommitHashOrBranchName);
    const result = await execPromise(`git diff ${ancestorHash}..${targetCommitHashOrBranchName} --name-only`, {cwd: repositoryPath});
    const files = result.split('\n');
    return files.filter(file => file.length !== 0).slice(offset, offset + limit);
}

/**
 * @description 获取提交被修改的文件
 * */
export async function getChangedFiles(repositoryPath: string, commitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<string[]>
{
    const firstCommitHash = await getFirstCommitHash(repositoryPath);
    if (commitHash === firstCommitHash)
    {
        return await getChangedFilesBetweenCommits(repositoryPath, EMPTY_TREE_HASH, commitHash, offset, limit);
    }
    else
    {
        return await getChangedFilesBetweenCommits(repositoryPath, `${commitHash}~`, commitHash, offset, limit);
    }
}

/**
 * @description 获取两仓库提交之间被修改的文件
 * */
export async function getChangedFilesBetweenRepositoriesCommits(baseRepositoryPath: string, baseRepositoryCommitHash: string, targetRepositoryPath: string, targetRepositoryCommitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<string[]>
{
    let tempRepositoryPath = '';
    try
    {
        // 复制源仓库
        tempRepositoryPath = await makeTemporaryRepository(baseRepositoryPath);
        // 判断是不是同一个仓库，不是同一个仓库需要 fetch
        if (baseRepositoryPath !== targetRepositoryPath)
        {
            // fetch 目标仓库
            const tempSourceRemoteName = `remote_${Date.now()}`;
            await addRemote(tempRepositoryPath, targetRepositoryPath, tempSourceRemoteName);
        }
        // 查看两个提交之间的发生变化的文件
        return await getChangedFilesBetweenCommits(tempRepositoryPath, baseRepositoryCommitHash, targetRepositoryCommitHash, offset, limit);
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
 * @description 获取两仓库提交之间被修改的文件
 * */
export async function getChangedFilesBetweenForks(baseRepositoryPath: string, baseRepositoryBranchName: string, targetRepositoryPath: string, targetRepositoryBranchName: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<string[]>
{
    let tempRepositoryPath = '';
    try
    {
        // 复制源仓库
        tempRepositoryPath = await makeTemporaryRepository(baseRepositoryPath, baseRepositoryBranchName);
        // 判断是不是同一个仓库，不是同一个仓库需要 fetch
        if (baseRepositoryPath !== targetRepositoryPath)
        {
            // fetch 目标仓库
            const tempRemoteName = `remote_${Date.now()}`;
            await addRemote(tempRepositoryPath, targetRepositoryPath, tempRemoteName);
            // 查看两个提交之间的发生变化的文件
            return await getChangedFilesBetweenCommits(tempRepositoryPath, baseRepositoryBranchName, `${tempRemoteName}/${targetRepositoryBranchName}`, offset, limit);
        }
        else
        {
            // 查看两个提交之间的发生变化的文件
            return await getChangedFilesBetweenCommits(tempRepositoryPath, baseRepositoryBranchName, `origin/${targetRepositoryBranchName}`, offset, limit);
        }
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
 * @description 获取某个文件在两次提交之间的差异信息
 * */
export async function getFileDiffInfoBetweenCommits(repositoryPath: string, filePath: string, baseCommitHashOrBranchName: string, targetCommitHashOrBranchName: string): Promise<FileDiff>
{
    const gitDiffOutput = await getFileGitDiffOutput(repositoryPath, filePath, baseCommitHashOrBranchName, targetCommitHashOrBranchName);
    const gitDiffOutputLines = getFileGitDiffOutputLines(gitDiffOutput);
    // 确定 @@ @@ 行的下标，用于切割数组
    let infoStringLineIndexes: number[] = [];
    // -1 和 length 用于切割数组
    infoStringLineIndexes.push(-1);
    infoStringLineIndexes.push(...getInfoStringLineIndexesFromFileGitDiffOutputLines(gitDiffOutputLines));
    infoStringLineIndexes.push(gitDiffOutputLines.length);
    // 把 @@ @@ 行之间的内容切割出来重组成字符串
    let codeBetweenInfoStringLines: string[] = [];
    for (let i = 1; i < infoStringLineIndexes.length; i++)
    {
        codeBetweenInfoStringLines.push(
            gitDiffOutputLines.slice(
                infoStringLineIndexes[i - 1] + 1,   // +1 是因为 1 行是 @@ 本身
                infoStringLineIndexes[i])
                .join('\n'),
        );
    }
    // 把 git diff 输出开头的文件信息取出来，并从原数组中删除
    const diffMetaInfo = codeBetweenInfoStringLines[0];
    codeBetweenInfoStringLines = codeBetweenInfoStringLines.slice(1);
    infoStringLineIndexes = infoStringLineIndexes.slice(1, -1);  // 去掉切割用的项
    const blockAmount = infoStringLineIndexes.length;
    const blockDiffs: BlockDiff[] = [];
    // 一个 @@ @@ 行搭配一段代码确认一个代码块
    for (let i = 0; i < blockAmount; i++)
    {
        const info = gitDiffOutputLines[infoStringLineIndexes[i]];
        const code = codeBetweenInfoStringLines[i];
        blockDiffs.push(new BlockDiff(info, code));
    }
    return new FileDiff(
        filePath,
        diffMetaInfo.toLowerCase().includes('new file'),
        diffMetaInfo.toLowerCase().includes('deleted'),
        diffMetaInfo.toLowerCase().includes('binary'),
        blockDiffs,
    );
}

/**
 * @description 获取某个文件某次提交的差异信息
 * */
export async function getFileDiff(repositoryPath: string, filePath: string, commitHash: string): Promise<FileDiff>
{
    const firstCommitHash = await getFirstCommitHash(repositoryPath);
    if (commitHash === firstCommitHash)
    {
        return await getFileDiffInfoBetweenCommits(repositoryPath, filePath, EMPTY_TREE_HASH, commitHash);
    }
    else
    {
        return await getFileDiffInfoBetweenCommits(repositoryPath, filePath, `${commitHash}~`, commitHash);
    }
}

/**
 * @description 获取某次提交的所有文件差异
 */
export async function getCommitFileDiffs(repositoryPath: string, commitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<FileDiff[]>
{
    const firstCommitHash = await getFirstCommitHash(repositoryPath);
    if (commitHash === firstCommitHash)
    {
        return await getFileDiffsBetweenCommits(repositoryPath, EMPTY_TREE_HASH, commitHash, offset, limit);
    }
    else
    {
        return await getFileDiffsBetweenCommits(repositoryPath,
            `${commitHash}~`
            , commitHash, offset, limit);
    }
}

/**
 * @description 获取两次提交间的所有文件差异
 */
export async function getFileDiffsBetweenCommits(repositoryPath: string, baseCommitHash: string, targetCommitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<FileDiff[]>
{
    const files = await getChangedFilesBetweenCommits(repositoryPath, baseCommitHash, targetCommitHash, offset, limit);
    return await Promise.all(files.map(async filePath =>
        await getFileDiffInfoBetweenCommits(repositoryPath, filePath, baseCommitHash, targetCommitHash)));
}

/**
 * @description 获取两仓库分支之间的提交文件差异
 * */
export async function getFileDiffsBetweenForks(baseRepositoryPath: string, baseRepositoryBranchName: string, targetRepositoryPath: string, targetRepositoryBranchName: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<FileDiff[]>
{
    let tempRepositoryPath = '';
    try
    {
        // 复制源仓库
        tempRepositoryPath = await makeTemporaryRepository(baseRepositoryPath, baseRepositoryBranchName);
        // 判断是不是同一个仓库
        if (baseRepositoryPath === targetRepositoryPath)
        {
            // 只克隆的 baseRepositoryBranch，因此需要对另一个分支加上 origin
            return await getFileDiffsBetweenCommits(tempRepositoryPath, baseRepositoryBranchName, `origin/${targetRepositoryBranchName}`, offset, limit);
        }
        else
        {
            // fetch 目标仓库
            const tempSourceRemoteName = `remote_${Date.now()}`;
            await addRemote(tempRepositoryPath, targetRepositoryPath, tempSourceRemoteName);
            // 得到源仓库分支到目标仓库分支的历史
            return await getFileDiffsBetweenCommits(tempRepositoryPath, baseRepositoryBranchName, `${tempSourceRemoteName}/${targetRepositoryBranchName}`, offset, limit);
        }
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
 * @description 获取两仓库提交之间的文件差异
 * */
export async function getFileDiffsBetweenRepositoriesCommits(baseRepositoryPath: string, baseRepositoryCommitHash: string, targetRepositoryPath: string, targetRepositoryCommitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<FileDiff[]>
{
    let tempRepositoryPath = '';
    try
    {
        // 复制源仓库
        tempRepositoryPath = await makeTemporaryRepository(baseRepositoryPath);
        // 判断是不是同一个仓库，不是同一个仓库需要 fetch
        if (baseRepositoryPath !== targetRepositoryPath)
        {
            // fetch 目标仓库
            const tempSourceRemoteName = `remote_${Date.now()}`;
            await addRemote(tempRepositoryPath, targetRepositoryPath, tempSourceRemoteName);
        }
        // 查看两个提交之间的提交差异
        return await getFileDiffsBetweenCommits(tempRepositoryPath, baseRepositoryCommitHash, targetRepositoryCommitHash, offset, limit);
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
 * @description 获取某文件两次提交之间的差异信息（是累计差异，从共同祖先开始计算）
 * */
async function getFileGitDiffOutput(repositoryPath: string, filePath: string, baseCommitHash: string, targetCommitHash: string): Promise<string>
{
    if (filePath.length === 0)
    {
        filePath = '.';
    }
    const ancestorHash = await getCommonAncestor(repositoryPath, baseCommitHash, targetCommitHash);
    return await execPromise(`git diff ${ancestorHash}..${targetCommitHash} -- '${filePath}'`, {cwd: repositoryPath});
}

function getFileGitDiffOutputLines(gitDiffOutput: string): string[]
{
    const rawLines = gitDiffOutput.split('\n');
    const lines: string[] = [];
    rawLines.forEach(line =>
    {
        if (line.length !== 0
            && line !== '\\ No newline at end of file'
            && line !== '\\ No newline at end of file\n')
        {
            lines.push(line);
        }
    });
    return lines;
}

function getInfoStringLineIndexesFromFileGitDiffOutputLines(gitDiffOutputLines: string[]): number[]
{
    const infoStringLineIndexes: number[] = [];
    for (let i = 0; i < gitDiffOutputLines.length; i++)
    {
        if (REGEX.BLOCK_DIFF_INFO_LINE.test(gitDiffOutputLines[i]))
        {
            infoStringLineIndexes.push(i);
        }
    }
    return infoStringLineIndexes;
}