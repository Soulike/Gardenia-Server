import {Readable} from 'stream';
import {spawn} from 'child_process';
import {String} from '../Function';

export async function doAdvertiseRPCCall(repositoryPath: string, service: string): Promise<string>
{
    return new Promise((resolve, reject) =>
    {
        const childProcess = spawn(`LANG=zh_CN.UTF-8 git ${service.slice(4)} --stateless-rpc --advertise-refs ${String.escapeLiteral(repositoryPath)}`, {
            shell: true,
        });

        childProcess.on('error', e => reject(e));

        const {stdout} = childProcess;
        const outputs: string[] = [];
        stdout.on('data', chunk => outputs.push(chunk));
        stdout.on('close', () => resolve(outputs.join('')));
        stdout.on('error', e => reject(e));
    });
}

/**
 * @description 执行 git 命令，并通过流的方式输入数据，返回命令的输出流
 * */
export async function doRPCCall(repositoryPath: string, command: string, parameterStream: Readable): Promise<Readable>
{
    return new Promise(((resolve, reject) =>
    {
        const {stdout, stdin} = spawn(`LANG=zh_CN.UTF-8 git ${command} --stateless-rpc ${String.escapeLiteral(repositoryPath)}`, {
            shell: true,
        });

        parameterStream.pipe(stdin);
        parameterStream.on('end', () =>
        {
            return resolve(stdout);
        });
        parameterStream.on('error', e => reject(e));
        stdin.on('error', e => reject(e));
        stdout.on('error', e => reject(e));
    }));
}

export async function doUpdateServerInfo(repositoryPath: string): Promise<void>
{
    return new Promise((resolve, reject) =>
    {
        const childProcess = spawn(`git --git-dir ${String.escapeLiteral(repositoryPath)} update-server-info`, {
            shell: true,
        });

        childProcess.on('error', e => reject(e));
        childProcess.on('exit', () => resolve());
    });
}