import {Readable} from 'stream';
import {spawn} from 'child_process';

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