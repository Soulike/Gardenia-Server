import {execPromise} from '../Function/Promisify';
import fse from 'fs-extra';
import {EMPTY_TREE_HASH, ObjectType} from '../CONSTANT';
import {Commit} from '../Class';
import {getFileLastCommit} from './Commit';
import os from 'os';
import path from 'path';
import {String} from '../Function';

/**
 * @description 获取两个提交/分支的公共祖先，在没有公共祖先时返回 EMPTY_TREE_HASH
 * */
export async function getCommonAncestor(repositoryPath: string, branchNameOrCommitHash1: string, branchNameOrCommitHash2: string): Promise<string>
{
    let commonAncestorHash: string | null;
    // 特殊情况，这个命令不接受 empty tree
    if (branchNameOrCommitHash1 === EMPTY_TREE_HASH || branchNameOrCommitHash2 === EMPTY_TREE_HASH)
    {
        commonAncestorHash = EMPTY_TREE_HASH;
    }
    else
    {
        try
        {
            // 如果这个命令报错，证明没有公共祖先
            commonAncestorHash = (await execPromise(`git merge-base ${String.escapeLiteral(branchNameOrCommitHash1)} ${String.escapeLiteral(branchNameOrCommitHash2)}`,
                {cwd: repositoryPath})).trim();
        }
        catch (e)
        {
            commonAncestorHash = EMPTY_TREE_HASH;
        }
    }
    return commonAncestorHash;
}

/**
 * @description 判断两个仓库分支之间有没有公共祖先
 * */
export async function hasCommonAncestor(repositoryPath1: string, branchNameOfRepository1: string, repositoryPath2: string, branchNameOfRepository2: string): Promise<boolean>
{
    if (repositoryPath1 === repositoryPath2)
    {
        return await getCommonAncestor(repositoryPath1, branchNameOfRepository1, branchNameOfRepository2) !== EMPTY_TREE_HASH;
    }
    else    // repositoryPath1 !== repositoryPath2
    {
        let tempRepositoryPath: string | null = null;
        try
        {
            tempRepositoryPath = await makeTemporaryRepository(repositoryPath1, branchNameOfRepository1);
            const tempRemoteName = 'remote';
            await addRemote(tempRepositoryPath, repositoryPath2, tempRemoteName);
            return await getCommonAncestor(tempRepositoryPath, branchNameOfRepository1, `${tempRemoteName}/${branchNameOfRepository2}`) !== EMPTY_TREE_HASH;
        }
        finally
        {
            if (typeof tempRepositoryPath === 'string')
            {
                await fse.remove(tempRepositoryPath);
            }
        }
    }
}

/**
 * @description 克隆裸仓库
 * */
export async function cloneBareRepository(sourceRepositoryPath: string, targetRepositoryPath: string): Promise<void>
{
    await execPromise(`git clone --bare ${String.escapeLiteral(sourceRepositoryPath)} ${String.escapeLiteral(targetRepositoryPath)}`);
}

/**
 * @description 克隆一个临时的工作区仓库，返回临时仓库路径
 * */
export async function makeTemporaryRepository(repositoryPath: string, branch?: string): Promise<string>
{
    const tempRepositoryPath = await fse.promises.mkdtemp(path.join(os.tmpdir(), 'gardenia_repository_'));
    try
    {
        await execPromise(`git clone ${branch ? `-b ${branch}` : ''} ${String.escapeLiteral(repositoryPath)} ${String.escapeLiteral(tempRepositoryPath)}`);
        return tempRepositoryPath;
    }
    catch (e)   // 如果克隆出问题，那么需要删除产生的临时文件夹
    {
        await fse.remove(tempRepositoryPath);
        throw e;
    }
}

/**
 * @description 添加仓库的远程源
 * */
export async function addRemote(repositoryPath: string, remoteRepositoryPath: string, remoteName: string): Promise<void>
{
    await execPromise(`git remote add -f ${String.escapeLiteral(remoteName)} ${String.escapeLiteral(remoteRepositoryPath)}`,
        {cwd: repositoryPath});
    await execPromise(`git remote update`, {cwd: repositoryPath});
}

/**
 * @description 获取某个提交某个路径下所有文件的类型、路径与最终提交信息
 * */
export async function getPathInfo(repositoryPath: string, commitHash: string, path: string): Promise<Array<{ type: ObjectType, path: string, commit: Commit }>>
{
    if (path.length === 0)
    {
        path = '.';
    }
    // 输出格式为 100644 blob 717a1cf8df1d86acd7daef6193298b6f7e4c1ccb	README.md
    // 注意前面的分隔符是空格，但是文件名之前的分隔符是 TAB
    const stdout = await execPromise(`git ls-tree ${String.escapeLiteral(commitHash)} ${String.escapeLiteral(path)}`,
        {cwd: repositoryPath});
    const fileInfoStrings = stdout.split(/\n/).filter(file => file.length !== 0);
    const fileInfos: Array<{ type: ObjectType, path: string, commit: Commit }> = [];
    await Promise.all(fileInfoStrings.map(async fileInfoString =>
    {
        const [restInfo, filePath] = fileInfoString.split('\t');
        const [, type] = restInfo.split(' ');
        let fileType: ObjectType = ObjectType.COMMIT;
        switch (type)
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
            case 'commit':
            {
                fileType = ObjectType.COMMIT;
                break;
            }
        }
        fileInfos.push({
            type: fileType,
            path: filePath,
            commit: await getFileLastCommit(repositoryPath, commitHash, filePath),
        });
    }));
    if (fileInfos.length === 0)
    {
        throw new Error('Folder does not exist');
    }
    return fileInfos;
}