import {BlockDiff, FileDiff} from '../Class';
import {getFirstCommitHash, getRepositoryCommitsBetweenCommits} from './Commit';
import fse from 'fs-extra';
import {REGEX} from '../CONSTANT';
import {execPromise} from '../Function/Promisify';
import {addRemote, makeTemporaryRepository} from './Tool';

/**
 * @description 获取两次提交之间被修改的文件
 * */
export async function getChangedFilesBetweenCommits(repositoryPath: string, baseCommitHash: string, targetCommitHash: string): Promise<string[]>
{
    const result = await execPromise(`git diff ${baseCommitHash}..${targetCommitHash} --name-only`, {cwd: repositoryPath});
    const files = result.split('\n');
    return files.filter(file => file.length !== 0);
}

/**
 * @description 获取某个文件在两次提交之间的差异信息
 * */
export async function getFileDiffInfoBetweenCommits(repositoryPath: string, filePath: string, baseCommitHash: string, targetCommitHash: string): Promise<FileDiff>
{
    const gitDiffOutput = await getFileGitDiffOutput(repositoryPath, filePath, baseCommitHash, targetCommitHash);
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
        // see https://stackoverflow.com/questions/40883798/how-to-get-git-diff-of-the-first-commit
        return await getFileDiffInfoBetweenCommits(repositoryPath, filePath, '4b825dc642cb6eb9a060e54bf8d69288fbee4904', commitHash);
    }
    else
    {
        return await getFileDiffInfoBetweenCommits(repositoryPath, filePath, `${commitHash}~`, commitHash);
    }
}

/**
 * @description 获取某次提交的所有文件差异
 */
export async function getCommitFileDiffs(repositoryPath: string, commitHash: string): Promise<FileDiff[]>
{
    const firstCommitHash = await getFirstCommitHash(repositoryPath);
    if (commitHash === firstCommitHash)
    {
        // see https://stackoverflow.com/questions/40883798/how-to-get-git-diff-of-the-first-commit
        return await getFileDiffsBetweenCommits(repositoryPath, '4b825dc642cb6eb9a060e54bf8d69288fbee4904', commitHash);
    }
    else
    {
        return await getFileDiffsBetweenCommits(repositoryPath,
            `${commitHash}~`
            , commitHash);
    }
}

/**
 * @description 获取两次提交间的所有文件差异
 */
export async function getFileDiffsBetweenCommits(repositoryPath: string, baseCommitHash: string, targetCommitHash: string): Promise<FileDiff[]>
{
    const files = await getChangedFilesBetweenCommits(repositoryPath, baseCommitHash, targetCommitHash);
    return await Promise.all(files.map(async filePath =>
        await getFileDiffInfoBetweenCommits(repositoryPath, filePath, baseCommitHash, targetCommitHash)));
}

/**
 * @description 获取两仓库分支之间的提交文件差异
 * */
export async function getFileDiffsBetweenForks(baseRepositoryPath: string, baseRepositoryBranchName: string, targetRepositoryPath: string, targetRepositoryBranchName: string): Promise<FileDiff[]>
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
        // 查看两个分支之间有没有提交差异
        const commits = await getRepositoryCommitsBetweenCommits(tempRepositoryPath, baseRepositoryBranchName, `${tempSourceRemoteName}/${targetRepositoryBranchName}`);
        if (commits.length > 1)   // 如果有，产生合并提交查看合并提交的差异
        {
            return await getFileDiffsBetweenCommits(tempRepositoryPath, commits[commits.length - 1].commitHash, commits[0].commitHash);
        }
        else if (commits.length === 1)   // 如果只有一个提交记录，需要特殊处理
        {
            return await getCommitFileDiffs(tempRepositoryPath, commits[0].commitHash);
        }
        else    // 没有提交差异，返回空
        {
            return [];
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

async function getFileGitDiffOutput(repositoryPath: string, filePath: string, baseCommitHash: string, targetCommitHash: string): Promise<string>
{
    return await execPromise(`git diff ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath});
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