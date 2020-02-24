import {BlockDiff, Branch, Commit, Conflict, FileDiff, PullRequest, Repository} from '../Class';
import {execPromise} from './Promisify';
import {ObjectType, REGEX} from '../CONSTANT';
import path from 'path';
import {GIT} from '../CONFIG';
import {Promisify, String} from './index';
import {Readable} from 'stream';
import {spawn} from 'child_process';
import {splitToLines} from './String';
import fse from 'fs-extra';

/**
 * @description 获取分支/文件的最后一次提交信息
 */
export async function getLastCommitInfo(repositoryPath: string, commitHash: string, file?: string): Promise<Commit>
{
    const tail = file ? `-- ${file}` : '';
    const info = await Promise.all([
        execPromise(`git log --pretty=format:'%H' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%cn' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ce' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ct' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%s' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%b' -1 ${commitHash} ${tail}`, {cwd: repositoryPath}),
    ]);

    const commit = new Commit(info[0], info[1], info[2], Number.parseInt(info[3]) * 1000, info[4], info[5]);
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
    const branches = await getBranches(repositoryPath);
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

export async function getDiffFilesBetweenCommits(repositoryPath: string, baseCommitHash: string, targetCommitHash: string): Promise<string[]>
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
export async function getFileDiffInfo(repositoryPath: string, filePath: string, commitHash: string): Promise<FileDiff>
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
 * @description 获取仓库两次提交之间的提交历史
 * */
export async function getRepositoryCommitHistoryBetweenCommits(repositoryPath: string, baseCommitHash: string, targetCommitHash: string): Promise<Commit[]>
{
    const [hashesString, committerNamesString, committerEmailsString, commitTimesString, commitMessagesString] = await Promise.all([
        execPromise(`git log --pretty=format:'%H' ${baseCommitHash}..${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%cn' ${baseCommitHash}..${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ce' ${baseCommitHash}..${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ct' ${baseCommitHash}..${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%s' ${baseCommitHash}..${targetCommitHash}`, {cwd: repositoryPath}),
    ]);
    const hashes = splitToLines(hashesString);
    const committerNames = splitToLines(committerNamesString);
    const committerEmails = splitToLines(committerEmailsString);
    const commitTimes = splitToLines(commitTimesString);
    const commitMessages = splitToLines(commitMessagesString);
    const commitBodies = await Promise.all(hashes.map(
        async hash => execPromise(`git log --pretty=format:'%b' -1 ${hash}`,
            {cwd: repositoryPath})));
    const length = hashes.length;
    const commits: Commit[] = [];
    for (let i = 0; i < length; i++)
    {
        commits.push(new Commit(
            hashes[i],
            committerNames[i],
            committerEmails[i],
            Number.parseInt(commitTimes[i]) * 1000,
            commitMessages[i],
            commitBodies[i]));
    }
    return commits;
}

/**
 * @description 获取仓库到 targetCommitHash 的提交历史
 * */
export async function getRepositoryCommitHistory(repositoryPath: string, targetCommitHash: string): Promise<Commit[]>
{
    const [hashesString, committerNamesString, committerEmailsString, commitTimesString, commitMessagesString] = await Promise.all([
        execPromise(`git log --pretty=format:'%H' ${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%cn' ${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ce' ${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ct' ${targetCommitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%s' ${targetCommitHash}`, {cwd: repositoryPath}),
    ]);
    const hashes = splitToLines(hashesString);
    const committerNames = splitToLines(committerNamesString);
    const committerEmails = splitToLines(committerEmailsString);
    const commitTimes = splitToLines(commitTimesString);
    const commitMessages = splitToLines(commitMessagesString);
    const commitBodies = await Promise.all(hashes.map(
        async hash => execPromise(`git log --pretty=format:'%b' -1 ${hash}`,
            {cwd: repositoryPath})));
    const length = hashes.length;
    const commits: Commit[] = [];
    for (let i = 0; i < length; i++)
    {
        commits.push(new Commit(
            hashes[i],
            committerNames[i],
            committerEmails[i],
            Number.parseInt(commitTimes[i]) * 1000,
            commitMessages[i],
            commitBodies[i]));
    }
    return commits;
}

/**
 * @description 获取某个文件两次提交之间的提交历史
 * */
export async function getFileCommitHistoryBetweenCommits(repositoryPath: string, filePath: string, baseCommitHash: string, targetCommitHash: string): Promise<Commit[]>
{
    const [hashesString, committerNamesString, committerEmailsString, commitTimesString, commitMessagesString] = await Promise.all([
        execPromise(`git log --pretty=format:'%H' ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%cn' ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ce' ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ct' ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%s' ${baseCommitHash}..${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
    ]);
    const hashes = splitToLines(hashesString);
    const committerNames = splitToLines(committerNamesString);
    const committerEmails = splitToLines(committerEmailsString);
    const commitTimes = splitToLines(commitTimesString);
    const commitMessages = splitToLines(commitMessagesString);
    const length = hashes.length;
    const commitBodies = await Promise.all(hashes.map(
        async hash => execPromise(`git log --pretty=format:'%b' -1 ${hash}`,
            {cwd: repositoryPath})));
    const commits: Commit[] = [];
    for (let i = 0; i < length; i++)
    {
        commits.push(new Commit(
            hashes[i],
            committerNames[i],
            committerEmails[i],
            Number.parseInt(commitTimes[i]) * 1000,
            commitMessages[i],
            commitBodies[i]));
    }
    return commits;
}

/**
 * @description 获取某个文件到 targetCommitHash 的提交历史
 * */
export async function getFileCommitHistory(repositoryPath: string, filePath: string, targetCommitHash: string): Promise<Commit[]>
{
    const [hashesString, committerNamesString, committerEmailsString, commitTimesString, commitMessagesString] = await Promise.all([
        execPromise(`git log --pretty=format:'%H' ${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%cn' ${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ce' ${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ct' ${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%s' ${targetCommitHash} -- ${filePath}`, {cwd: repositoryPath}),
    ]);
    const hashes = splitToLines(hashesString);
    const committerNames = splitToLines(committerNamesString);
    const committerEmails = splitToLines(committerEmailsString);
    const commitTimes = splitToLines(commitTimesString);
    const commitMessages = splitToLines(commitMessagesString);
    const length = hashes.length;
    const commitBodies = await Promise.all(hashes.map(
        async hash => execPromise(`git log --pretty=format:'%b' -1 ${hash}`,
            {cwd: repositoryPath})));
    const commits: Commit[] = [];
    for (let i = 0; i < length; i++)
    {
        commits.push(new Commit(
            hashes[i],
            committerNames[i],
            committerEmails[i],
            Number.parseInt(commitTimes[i]) * 1000,
            commitMessages[i],
            commitBodies[i]));
    }
    return commits;
}

/**
 * @description 获取某次提交的信息
 * */
export async function getCommitInfo(repositoryPath: string, commitHash: string): Promise<Commit>
{
    const [hash, committerName, committerEmail, commitTime, commitMessage, commitBody] = await Promise.all([
        execPromise(`git log --pretty=format:'%H' -1 ${commitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%cn' -1 ${commitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ce' -1 ${commitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ct' -1 ${commitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%s' -1 ${commitHash}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%b' -1 ${commitHash}`, {cwd: repositoryPath}),
    ]);
    return new Commit(
        hash,
        committerName,
        committerEmail,
        Number.parseInt(commitTime) * 1000,
        commitMessage,
        commitBody);
}

/**
 * @description 获取某次提交的所有文件差异
 */
export async function getCommitDiff(repositoryPath: string, commitHash: string): Promise<FileDiff[]>
{
    const firstCommitHash = await getFirstCommitHash(repositoryPath);
    if (commitHash === firstCommitHash)
    {
        // see https://stackoverflow.com/questions/40883798/how-to-get-git-diff-of-the-first-commit
        return await getDiffBetweenCommits(repositoryPath, '4b825dc642cb6eb9a060e54bf8d69288fbee4904', commitHash);
    }
    else
    {
        return await getDiffBetweenCommits(repositoryPath, `${commitHash}~`, commitHash);
    }
}

/**
 * @description 获取两次提交间的所有文件差异
 */
export async function getDiffBetweenCommits(repositoryPath: string, baseCommitHash: string, targetCommitHash: string): Promise<FileDiff[]>
{
    const files = await getDiffFilesBetweenCommits(repositoryPath, baseCommitHash, targetCommitHash);
    return await Promise.all(files.map(async filePath =>
        await getFileDiffInfoBetweenCommits(repositoryPath, filePath, baseCommitHash, targetCommitHash)));
}

/**
 * @description 获取第一次提交的 hash
 * */
export async function getFirstCommitHash(repositoryPath: string): Promise<string>
{
    return await execPromise(`git log --pretty=format:'%H' | tail -1`, {cwd: repositoryPath});
}

/**
 * @description 获取某个文件第一次提交的 hash
 * */
export async function getFileFirstCommitHash(repositoryPath: string, filePath: string): Promise<string>
{
    return await execPromise(`git log --pretty=format:'%H' -- ${filePath} | tail -1`, {cwd: repositoryPath});
}

/**
 * @description 获取所有分支信息
 * */
export async function getBranches(repositoryPath: string): Promise<Branch[]>
{
    const branchOutput = await execPromise(`git branch`, {cwd: repositoryPath});
    const branchLines = splitToLines(branchOutput);
    return await Promise.all(branchLines.map(async line =>
    {
        const sign = line.slice(0, 2);
        const branchName = line.slice(2);
        const commit = await getCommitInfo(repositoryPath, branchName);
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

/**
 * @description 克隆裸仓库
 * */
export async function cloneBareRepository(sourceRepositoryPath: string, targetRepositoryPath: string): Promise<void>
{
    await execPromise(`git clone --bare ${sourceRepositoryPath} ${targetRepositoryPath}`);
}

/**
 * @description 克隆一个临时的工作区仓库，返回临时仓库路径
 * */
export async function makeTemporaryRepository(repositoryPath: string, branch: string): Promise<string>
{
    const tempRepositoryPath = await fse.promises.mkdtemp('repository_');
    await execPromise(`git clone -b ${branch} ${repositoryPath} ${tempRepositoryPath}`);
    return tempRepositoryPath;
}

/**
 * @description 添加仓库的远程源
 * */
export async function addRemote(repositoryPath: string, remoteRepositoryPath: string, remoteName: string): Promise<void>
{
    await execPromise(`git remote add -f ${remoteName} ${remoteRepositoryPath}`,
        {cwd: repositoryPath});
    await execPromise(`git remote update`, {cwd: repositoryPath});
}

/**
 * @description 检测两个仓库是不是可以自动合并
 * */
export async function isMergeable(sourceRepositoryPath: string, sourceRepositoryBranch: string, targetRepositoryPath: string, targetRepositoryBranch: string): Promise<boolean>
{
    let tempRepositoryPath = '';
    try
    {
        tempRepositoryPath = await makeTemporaryRepository(targetRepositoryPath, targetRepositoryBranch);
        const tempSourceRemoteName = `remote_${Date.now()}`;
        await addRemote(tempRepositoryPath, sourceRepositoryPath, tempSourceRemoteName);
        await execPromise(`git merge --no-commit --no-ff ${tempSourceRemoteName}/${sourceRepositoryBranch}`,
            {cwd: tempRepositoryPath});
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
export async function merge(sourceRepositoryPath: string, sourceRepositoryBranch: string, targetRepositoryPath: string, targetRepositoryBranch: string): Promise<void>
{
    let tempRepositoryPath = '';
    try
    {
        tempRepositoryPath = await makeTemporaryRepository(targetRepositoryPath, targetRepositoryBranch);
        const tempSourceRemoteName = `remote_${Date.now()}`;
        await addRemote(tempRepositoryPath, sourceRepositoryPath, tempSourceRemoteName);
        await execPromise(`git merge ${tempSourceRemoteName}/${sourceRepositoryBranch}`,
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

/**
 * @description 获取存在合并冲突的文件列表
 * @return 文件路径数组
 * */
export async function getConflictFiles(sourceRepositoryPath: string, sourceRepositoryBranch: string, targetRepositoryPath: string, targetRepositoryBranch: string): Promise<string[]>
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
        return String.splitToLines(
            await execPromise(`git ls-files -u | cut -f 2 | sort -u`, {cwd: tempRepositoryPath}));
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
                await fse.outputFile(filePath, content),
            ));
            // 暂存所有更改
            await Promise.all(conflicts.map(async ({filePath}) =>
                await execPromise(`git add ${filePath}`,
                    {cwd: repositoryPath}),
            ));
            // 进行提交
            const {no} = pullRequest;
            await execPromise(`git commit -m '解决 Pull Request #${no} 的冲突'`,
                {cwd: repositoryPath});
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