import {BlockDiff, Commit, FileDiff, Repository} from '../Class';
import {execPromise} from './Promisify';
import {ObjectType, REGEX} from '../CONSTANT';
import path from 'path';
import {GIT} from '../CONFIG';
import {Promisify} from './index';
import {Readable} from 'stream';
import {spawn} from 'child_process';
import {splitToLines} from './String';

export async function getAllBranches(repositoryPath: string): Promise<string[]>
{
    const stdout = await execPromise(`git branch --format='%(refname:short)'`, {cwd: repositoryPath});
    return stdout.split('\n').filter(value => value.length > 0);
}

export function putMasterBranchToFront(branches: Readonly<string[]>, masterBranchName: string): string[]
{
    const index = branches.indexOf(masterBranchName);
    if (index === -1)
    {
        throw new TypeError(`No master branch "${masterBranchName}" in "branches" array`);
    }
    return [
        branches[index],
        ...branches.slice(0, index),
        ...branches.slice(index + 1),
    ];
}

/**
 * @description 获取分支/文件的最后一次提交信息
 */
export async function getLastCommitInfo(repositoryPath: string, commitHash: string, file?: string): Promise<Commit>
{
    const tail = file ? `-- ${file}` : '';
    const info = await Promise.all([
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%H' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cn' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%ce' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cr' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%s' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%b' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
    ]);

    const commit = new Commit(info[0], info[1], info[2], info[3], info[4], info[5]);
    if (commit.commitHash.length === 0)
    {
        throw new Error('Object does not exist');
    }
    return commit;
}

/**
 * @description 获取某个路径下所有文件的类型、路径与最终提交信息
 * */
export async function getFileCommitInfoList(repositoryPath: string, commitHash: string, path: string): Promise<Array<{ type: ObjectType, path: string, commit: Commit }>>
{
    const stdout = await execPromise(`git ls-tree ${commitHash} ${path}`, {cwd: repositoryPath});
    const fileInfoStringList = stdout.split(/\n/).filter(file => file.length !== 0);
    const fileCommitInfoList: Array<{ type: ObjectType, path: string, commit: Commit }> = [];
    await Promise.all(fileInfoStringList.map(async fileInfoString =>
    {
        const infoStringArray = fileInfoString.split(/\s+/);
        let fileType: ObjectType = ObjectType.BLOB;
        switch (infoStringArray[1])
        {
            case 'blob':
            {
                fileType = ObjectType.BLOB;
                break;
            }
            case 'tree':
            {
                fileType = ObjectType.TREE;
                break;
            }
        }
        fileCommitInfoList.push({
            type: fileType,
            path: infoStringArray[3],
            commit: await getLastCommitInfo(repositoryPath, commitHash, infoStringArray[3]),
        });
    }));
    if (fileCommitInfoList.length === 0)
    {
        throw new Error('Folder does not exist');
    }
    return fileCommitInfoList;
}

/**
 * @description 获取对象的哈希
 * */
export async function getObjectHash(repositoryPath: string, filePath: string, commitHash: string): Promise<string>
{
    // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
    const lsTreeOut = await execPromise(`git ls-tree ${commitHash} -- ${filePath}`,
        {cwd: repositoryPath});
    if (lsTreeOut.length === 0) // 没有输出则文件不存在
    {
        throw new Error('Object does not exist');
    }
    else
    {
        return lsTreeOut.split(/\s+/)[2];
    }
}

/**
 * @description 获取对象的类型
 * */
export async function getObjectType(repositoryPath: string, filePath: string, commitHash: string): Promise<ObjectType>
{
    // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
    const lsTreeOut = await execPromise(`git ls-tree ${commitHash} -- ${filePath}`,
        {cwd: repositoryPath});
    if (lsTreeOut.length === 0) // 没有输出则文件不存在
    {
        throw new Error('Object does not exist');
    }
    else
    {
        return lsTreeOut.split(/\s+/)[1] === 'tree' ? ObjectType.TREE : ObjectType.BLOB;
    }
}

export function generateRepositoryPath(repository: Readonly<Pick<Repository, 'username' | 'name'>>): string
{
    const {username, name} = repository;
    return path.join(GIT.ROOT, username, `${name}.git`);
}

export async function getCommitCount(repositoryPath: string, commitHash: string): Promise<number>
{
    // 首先判断是否存在 master 分支，如果没有进行过任何提交是没有 master 分支的
    const branches = await getAllBranches(repositoryPath);
    if (branches.length === 0)
    {
        return 0;
    }
    // 以下命令会因为不存在 master 分支报错
    const stdout = await execPromise(`git rev-list ${commitHash} --count`, {cwd: repositoryPath});
    return Number.parseInt(stdout);
}

// 注意在 commitHash 不存在时将会抛出错误
export async function objectExists(repositoryPath: string, filePath: string, commitHash: string): Promise<boolean>
{
    const stdout = await execPromise(`git ls-tree ${commitHash} -- ${filePath}`, {cwd: repositoryPath});
    return stdout.length !== 0;
}

export async function isBinaryObject(repositoryPath: string, objectHash: string): Promise<boolean>
{
    const stdout = (await execPromise(`git cat-file -p ${objectHash} | file -`, {cwd: repositoryPath})).toLowerCase();
    return !(stdout.includes('text') || stdout.includes('json') || stdout.includes('svg'));
}

export async function getObjectSize(repositoryPath: string, objectHash: string): Promise<number>
{
    return Number.parseInt(
        await Promisify.execPromise(`git cat-file -s ${objectHash}`,
            {cwd: repositoryPath}));
}

export function getObjectReadStream(repositoryPath: string, objectHash: string): Readable
{
    const {stdout} = spawn(`git cat-file -p ${objectHash}`,
        {
            cwd: repositoryPath,
            shell: true,
        });
    return stdout;
}

export async function doAdvertiseRPCCall(repositoryPath: string, service: string): Promise<string>
{
    return new Promise((resolve, reject) =>
    {
        const childProcess = spawn(`LANG=en_US git ${service.slice(4)} --stateless-rpc --advertise-refs ${repositoryPath}`, {
            shell: true,
        });

        childProcess.on('error', e =>
        {
            return reject(e);
        });

        const {stdout} = childProcess;
        const outputs: string[] = [];
        stdout.on('data', chunk =>
        {
            outputs.push(chunk);
        });

        stdout.on('close', () =>
        {
            return resolve(outputs.join(''));
        });
    });
}

/**
 * @description 执行 git 命令，并通过流的方式输入数据，返回命令的输出流
 * */
export function doRPCCall(repositoryPath: string, command: string, parameterStream: Readable): Readable
{
    const {stdout, stdin} = spawn(`LANG=en_US git ${command} --stateless-rpc ${repositoryPath}`, {
        shell: true,
    });
    parameterStream.pipe(stdin);
    return stdout;
}

export async function doUpdateServerInfo(repositoryPath: string): Promise<void>
{
    return new Promise((resolve, reject) =>
    {
        const childProcess = spawn(`git --git-dir ${repositoryPath} update-server-info`, {
            shell: true,
        });

        childProcess.on('error', e =>
        {
            return reject(e);
        });

        childProcess.on('exit', () =>
        {
            return resolve();
        });
    });
}

export async function getDiffFiles(repositoryPath: string, baseCommitHash: string, targetCommitHash: string): Promise<string[]>
{
    const result = await execPromise(`git diff ${baseCommitHash}..${targetCommitHash} --name-only`, {cwd: repositoryPath});
    const files = result.split('\n');
    return files.filter(file => file.length !== 0);
}

async function getFileGitDiffOutput(repositoryPath: string, filePath: string, baseCommitHash: string, targetCommitHash: string): Promise<string>
{
    return await execPromise(`git diff ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath});
}

function getFileGitDiffOutputLines(gitDiffOutput: string): string[]
{
    return gitDiffOutput.split('\n').filter(line =>
    {
        if (line.length !== 0)
        {
            return line !== '\\ No newline at end of file'
                && line !== '\\ No newline at end of file\n';
        }
        else
        {
            return false;
        }
    });
}

function getInfoStringLineIndexesFromFileGitDiffOutputLines(gitDiffOutputLines: string[]): number[]
{
    const infoStringLineIndexes: number[] = [];
    for (let i = 0; i < gitDiffOutputLines.length; i++)
    {
        if (REGEX.BLOCK_DIFF_INFO.test(gitDiffOutputLines[i]))
        {
            infoStringLineIndexes.push(i);
        }
    }
    return infoStringLineIndexes;
}

export async function getFileDiffInfo(repositoryPath: string, filePath: string, baseCommitHash: string, targetCommitHash: string): Promise<FileDiff>
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
        diffMetaInfo.includes('new file'),
        diffMetaInfo.includes('deleted'),
        blockDiffs,
    );
}

export async function getRepositoryCommitHistoryBetweenCommits(repositoryPath: string, baseCommitHash: string, targetCommitHash: string): Promise<Commit[]>
{
    const [hashesString, committerNamesString, committerEmailsString, commitTimesString, commitMessagesString] = await Promise.all([
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%H' ${baseCommitHash}..${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cn' ${baseCommitHash}..${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%ce' ${baseCommitHash}..${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cd' ${baseCommitHash}..${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%s' ${baseCommitHash}..${targetCommitHash}`, {cwd: repositoryPath}),
    ]);
    const hashes = splitToLines(hashesString);
    const committerNames = splitToLines(committerNamesString);
    const committerEmails = splitToLines(committerEmailsString);
    const commitTimes = splitToLines(commitTimesString);
    const commitMessages = splitToLines(commitMessagesString);
    const commitBodies = await Promise.all(hashes.map(
        async hash => execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%b' -1 ${hash}`,
            {cwd: repositoryPath})));
    const length = hashes.length;
    const commits: Commit[] = [];
    for (let i = 0; i < length; i++)
    {
        commits.push(new Commit(
            hashes[i],
            committerNames[i],
            committerEmails[i],
            commitTimes[i],
            commitMessages[i],
            commitBodies[i]));
    }
    return commits;
}

export async function getRepositoryCommitHistory(repositoryPath: string, targetCommitHash: string): Promise<Commit[]>
{
    const [hashesString, committerNamesString, committerEmailsString, commitTimesString, commitMessagesString] = await Promise.all([
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%H' ${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cn' ${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%ce' ${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cd' ${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%s' ${targetCommitHash}`, {cwd: repositoryPath}),
    ]);
    const hashes = splitToLines(hashesString);
    const committerNames = splitToLines(committerNamesString);
    const committerEmails = splitToLines(committerEmailsString);
    const commitTimes = splitToLines(commitTimesString);
    const commitMessages = splitToLines(commitMessagesString);
    const commitBodies = await Promise.all(hashes.map(
        async hash => execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%b' -1 ${hash}`,
            {cwd: repositoryPath})));
    const length = hashes.length;
    const commits: Commit[] = [];
    for (let i = 0; i < length; i++)
    {
        commits.push(new Commit(
            hashes[i],
            committerNames[i],
            committerEmails[i],
            commitTimes[i],
            commitMessages[i],
            commitBodies[i]));
    }
    return commits;
}

export async function getFileCommitHistoryBetweenCommits(repositoryPath: string, filePath: string, baseCommitHash: string, targetCommitHash: string): Promise<Commit[]>
{
    const [hashesString, committerNamesString, committerEmailsString, commitTimesString, commitMessagesString] = await Promise.all([
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%H' ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cn' ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%ce' ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cd' ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%s' ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
    ]);
    const hashes = splitToLines(hashesString);
    const committerNames = splitToLines(committerNamesString);
    const committerEmails = splitToLines(committerEmailsString);
    const commitTimes = splitToLines(commitTimesString);
    const commitMessages = splitToLines(commitMessagesString);
    const length = hashes.length;
    const commitBodies = await Promise.all(hashes.map(
        async hash => execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%b' -1 ${hash}`,
            {cwd: repositoryPath})));
    const commits: Commit[] = [];
    for (let i = 0; i < length; i++)
    {
        commits.push(new Commit(
            hashes[i],
            committerNames[i],
            committerEmails[i],
            commitTimes[i],
            commitMessages[i],
            commitBodies[i]));
    }
    return commits;
}

export async function getFileCommitHistory(repositoryPath: string, filePath: string, targetCommitHash: string): Promise<Commit[]>
{
    const [hashesString, committerNamesString, committerEmailsString, commitTimesString, commitMessagesString] = await Promise.all([
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%H' ${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cn' ${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%ce' ${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cd' ${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%s' ${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
    ]);
    const hashes = splitToLines(hashesString);
    const committerNames = splitToLines(committerNamesString);
    const committerEmails = splitToLines(committerEmailsString);
    const commitTimes = splitToLines(commitTimesString);
    const commitMessages = splitToLines(commitMessagesString);
    const length = hashes.length;
    const commitBodies = await Promise.all(hashes.map(
        async hash => execPromise(`LANG=zh_CN.UTF-8 git log --pretty=format:'%b' -1 ${hash}`,
            {cwd: repositoryPath})));
    const commits: Commit[] = [];
    for (let i = 0; i < length; i++)
    {
        commits.push(new Commit(
            hashes[i],
            committerNames[i],
            committerEmails[i],
            commitTimes[i],
            commitMessages[i],
            commitBodies[i]));
    }
    return commits;
}

export async function getFirstCommitHash(repositoryPath: string): Promise<string>
{
    return await execPromise(`git log --pretty=format:'%H' | tail -1`, {cwd: repositoryPath});
}

export async function getFileFirstCommitHash(repositoryPath: string, filePath: string): Promise<string>
{
    return await execPromise(`git log --pretty=format:'%H' -- ${filePath} | tail -1`, {cwd: repositoryPath});
}