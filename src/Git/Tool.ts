import {execPromise} from '../Function/Promisify';
import fse from 'fs-extra';
import {ObjectType} from '../CONSTANT';
import {Commit} from '../Class';
import {getFileLastCommit} from './Commit';
import os from 'os';
import path from 'path';

/**
 * @description 获取两个提交/分支的公共祖先
 * */
export async function getCommonAncestor(repositoryPath: string, branchNameOrCommitHash1: string, branchNameOrCommitHash2: string): Promise<string>
{
    return (await execPromise(`git merge-base ${branchNameOrCommitHash1} ${branchNameOrCommitHash2}`,
        {cwd: repositoryPath})).trim();
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
export async function makeTemporaryRepository(repositoryPath: string, branch?: string): Promise<string>
{
    const tempRepositoryPath = await fse.promises.mkdtemp(path.join(os.tmpdir(), 'gardenia_repository_'));
    try
    {
        await execPromise(`git clone ${branch ? `-b ${branch}` : ''} ${repositoryPath} ${tempRepositoryPath}`);
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
    await execPromise(`git remote add -f ${remoteName} ${remoteRepositoryPath}`,
        {cwd: repositoryPath});
    await execPromise(`git remote update`, {cwd: repositoryPath});
}

/**
 * @description 获取某个提交某个路径下所有文件的类型、路径与最终提交信息
 * */
export async function getPathInfo(repositoryPath: string, commitHash: string, path: string): Promise<Array<{ type: ObjectType, path: string, commit: Commit }>>
{
    // 输出格式为 100644 blob 717a1cf8df1d86acd7daef6193298b6f7e4c1ccb	README.md
    const stdout = await execPromise(`git ls-tree ${commitHash} ${path}`,
        {cwd: repositoryPath});
    const fileInfoStrings = stdout.split(/\n/).filter(file => file.length !== 0);
    const fileInfos: Array<{ type: ObjectType, path: string, commit: Commit }> = [];
    await Promise.all(fileInfoStrings.map(async fileInfoString =>
    {
        const [, type, , filePath] = fileInfoString.split(/\s+/);
        let fileType: ObjectType = ObjectType.BLOB;
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