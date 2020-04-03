import {execPromise} from '../Function/Promisify';
import {Promisify} from '../Function';
import {ObjectType} from '../CONSTANT';
import {Readable} from 'stream';
import {spawn} from 'child_process';

/**
 * @description 获取文件对象的哈希
 * */
export async function getFileObjectHash(repositoryPath: string, filePath: string, commitHashOrBranchName: string): Promise<string>
{
    // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
    const lsTreeOut = await execPromise(`git ls-tree ${commitHashOrBranchName} -- '${filePath}'`,
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
 * @description 获取文件对象的类型
 * */
export async function getFileObjectType(repositoryPath: string, filePath: string, commitHashOrBranchName: string): Promise<ObjectType>
{
    // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
    const lsTreeOut = await execPromise(`git ls-tree ${commitHashOrBranchName} -- '${filePath}'`,
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

/**
 * @description 查看某提交中的某个文件是否存在
 * 注意在 commitHashOrBranchName 不存在时将会抛出错误
 * */
export async function fileExists(repositoryPath: string, filePath: string, commitHashOrBranchName: string): Promise<boolean>
{
    const stdout = await execPromise(`git ls-tree ${commitHashOrBranchName} -- '${filePath}'`, {cwd: repositoryPath});
    return stdout.length !== 0;
}

/**
 * @description 查看某提交中的某个文件是否是二进制文件
 * */
export async function isBinaryFile(repositoryPath: string, objectHash: string): Promise<boolean>
{
    const stdout = (await execPromise(`git cat-file -p ${objectHash} | file -`, {cwd: repositoryPath})).toLowerCase();
    return !(stdout.includes('text') || stdout.includes('json') || stdout.includes('svg'));
}

/**
 * @description 查看文件对象哈希对应文件的大小
 * */
export async function getFileSize(repositoryPath: string, fileObjectHash: string): Promise<number>
{
    return Number.parseInt(
        await Promisify.execPromise(`git cat-file -s ${fileObjectHash}`,
            {cwd: repositoryPath}));
}

/**
 * @description 获取文件对象哈希对应文件的可读流
 * */
export function getFileReadStream(repositoryPath: string, objectHash: string): Readable
{
    const {stdout} = spawn(`git cat-file -p ${objectHash}`,
        {
            cwd: repositoryPath,
            shell: true,
        });
    return stdout;
}