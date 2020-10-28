import {execPromise} from '../Function/Promisify';
import {Promisify, String} from '../Function';
import {ObjectType} from '../CONSTANT';
import {Readable} from 'stream';
import {spawn} from 'child_process';
import {SERVER} from '../CONFIG';

/**
 * @description 获取文件对象的哈希
 * */
export async function getFileObjectHash(repositoryPath: string, filePath: string, commitHashOrBranchName: string): Promise<string>
{
    if (filePath.length === 0)
    {
        filePath = '.';
    }
    // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
    const lsTreeOut = await execPromise(`git ls-tree ${String.escapeLiteral(commitHashOrBranchName)} -- ${String.escapeLiteral(filePath)}`,
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
    if (filePath.length === 0)
    {
        filePath = '.';
    }
    // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
    const lsTreeOut = await execPromise(`git ls-tree ${String.escapeLiteral(commitHashOrBranchName)} -- ${String.escapeLiteral(filePath)}`,
        {cwd: repositoryPath});
    if (lsTreeOut.length === 0) // 没有输出则文件不存在
    {
        throw new Error('Object does not exist');
    }
    else
    {
        const type = lsTreeOut.split(/\s+/)[1];
        switch (type)
        {
            case 'blob':
            {
                return ObjectType.BLOB;
            }
            case 'tree':
            {
                return ObjectType.TREE;
            }
            case 'commit':
            {
                return ObjectType.COMMIT;
            }
            default:
            {
                return ObjectType.COMMIT;
            }
        }
    }
}

/**
 * @description 查看某提交中的某个文件是否存在，提交不存在或文件不存在都会返回 false
 * */
export async function fileExists(repositoryPath: string, filePath: string, commitHashOrBranchName: string): Promise<boolean>
{
    if (filePath.length === 0)
    {
        filePath = '.';
    }
    try
    {
        const stdout = await execPromise(`git ls-tree ${String.escapeLiteral(commitHashOrBranchName)} -- ${String.escapeLiteral(filePath)}`, {cwd: repositoryPath});
        const objectType = stdout.split(' ')[1];
        return stdout.length !== 0 && (objectType === ObjectType.BLOB || objectType === ObjectType.TREE);
    }
    catch (e)
    {
        SERVER.WARN_LOGGER(e);
        return false;
    }
}

/**
 * @description 利用 file 命令行得到文件类型
 * */
export async function getFileType(repositoryPath: string, objectHash: string): Promise<string>
{
    return await execPromise(`git cat-file -p ${objectHash} | file -`, {cwd: repositoryPath});
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