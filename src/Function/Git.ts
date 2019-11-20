import {Commit, Repository} from '../Class';
import {execPromise} from './Promisify';
import {ObjectType} from '../CONSTANT';
import path from 'path';
import {GIT} from '../CONFIG';
import {Promisify} from './index';
import {Readable} from 'stream';
import {spawn} from 'child_process';

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
    ]);

    const commit = new Commit(info[0], info[1], info[2], info[3], info[4]);
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