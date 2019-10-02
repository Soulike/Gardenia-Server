import {exec} from 'child_process';
import {Commit} from '../Class';
import {execPromise} from './Promisify';
import {ObjectType} from '../CONSTANT';

/**
 * @description 获取仓库的所有分支，主分支放在首个
 */
export async function getBranches(repositoryPath: string): Promise<Array<string>>
{
    return new Promise((resolve, reject) =>
    {
        exec('git branch', {cwd: repositoryPath}, (error, stdout) =>
        {
            if (error)
            {
                return reject(error);
            }
            const splitResult = stdout.split(/\s+/).filter(branch => branch.length !== 0);
            const masterPosition = splitResult.indexOf('*') + 1;

            return resolve(([] as Array<string>).concat(
                splitResult.slice(masterPosition, masterPosition + 1),
                splitResult.slice(0, masterPosition - 1),
                splitResult.slice(masterPosition + 1)));
        });
    });
}

/**
 * @description 获取分支/文件的最后一次提交信息
 */
export async function getLastCommitInfo(repositoryPath: string, branch: string, file?: string): Promise<Commit>
{
    const tail = file ? `-- ${file}` : '';
    const info = await Promise.all([
        execPromise(`git log --pretty=format:'%H' -1 ${branch} ${tail}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%cn' -1 ${branch} ${tail}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%ce' -1 ${branch} ${tail}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%cr' -1 ${branch} ${tail}`, {cwd: repositoryPath}),
        execPromise(`git log --pretty=format:'%s' -1 ${branch} ${tail}`, {cwd: repositoryPath}),
    ]) as Array<string>;

    return new Commit(info[0], info[1], info[2], info[3], info[4]);
}

/**
 * @description 获取某个路径下所有文件的类型、路径与最终提交信息
 * */
export async function getFileCommitInfoList(repositoryPath: string, branch: string, path: string): Promise<Array<{ type: ObjectType, path: string, commit: Commit }>>
{
    const stdout = await execPromise(`git ls-tree ${branch} ${path}`, {cwd: repositoryPath}) as string;
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
            commit: await getLastCommitInfo(repositoryPath, branch, infoStringArray[3]),
        });
    }));
    return fileCommitInfoList;
}

/**
 * @description 获取对象的哈希
 * */
export async function getObjectHash(repositoryPath: string, filePath: string, commitHash: string): Promise<string | null>
{
    // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
    const lsTreeOut = await execPromise(`git ls-tree ${commitHash} -- ${filePath}`,
        {cwd: repositoryPath}) as string;
    if (lsTreeOut.length === 0) // 没有输出则文件不存在，返回 null
    {
        return null;
    }
    else
    {
        return lsTreeOut.split(/\s+/)[2];
    }
}

/**
 * @description 获取对象的类型
 * */
export async function getObjectType(repositoryPath: string, filePath: string, commitHash: string): Promise<ObjectType | null>
{
    // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
    const lsTreeOut = await execPromise(`git ls-tree ${commitHash} -- ${filePath}`,
        {cwd: repositoryPath}) as string;
    if (lsTreeOut.length === 0) // 没有输出则文件不存在，返回 null
    {
        return null;
    }
    else
    {
        return lsTreeOut.split(/\s+/)[1] === 'tree' ? ObjectType.TREE : ObjectType.BLOB;
    }
}