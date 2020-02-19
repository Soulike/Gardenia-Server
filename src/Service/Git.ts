import fs from 'fs';
import {Git, Repository as RepositoryFuncton} from '../Function';
import mime from 'mime-types';
import {Repository, ServiceResponse} from '../Class';
import path from 'path';
import {Repository as RepositoryTable} from '../Database';
import {Readable} from 'stream';

export async function file(repository: Readonly<Pick<Repository, 'username' | 'name'>>, filePath: string, headers: Readonly<any>): Promise<ServiceResponse<Readable | string>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null)  // 仓库不存在
    {
        return new ServiceResponse<string>(404, {}, '仓库不存在');
    }
    if (!(await RepositoryFuncton.repositoryIsAvailableToTheRequest(repositoryInDatabase, headers)))
    {
        return new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'});
    }

    return new Promise(resolve =>
    {
        const repositoryPath = Git.generateRepositoryPath(repository);
        const absoluteFilePath = path.join(repositoryPath, filePath);
        const readStream = fs.createReadStream(absoluteFilePath);

        readStream.on('error', () =>
        {
            resolve(new ServiceResponse<string>(404, {}, '请求的文件不存在'));
        });

        readStream.on('ready', () =>
        {
            const type = mime.lookup(absoluteFilePath) || 'application/octet-stream';
            resolve(new ServiceResponse<Readable>(200, {
                'Content-Type': mime.contentType(type) || 'application/octet-stream',
            }, readStream));
        });
    });
}

export async function advertise(repository: Readonly<Pick<Repository, 'username' | 'name'>>, service: string, headers: Readonly<any>): Promise<ServiceResponse<string | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null)  // 仓库不存在
    {
        return new ServiceResponse<string>(404, {}, '仓库不存在');
    }
    if (!(await RepositoryFuncton.repositoryIsAvailableToTheRequest(repositoryInDatabase, headers)))
    {
        return new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'});
    }
    if (service === 'git-receive-pack'
        && !(await RepositoryFuncton.repositoryIsModifiableToTheRequest(repositoryInDatabase, headers)))
    {
        return new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'});
    }

    const repositoryPath = Git.generateRepositoryPath(repository);
    const RPCCallOutput = await Git.doAdvertiseRPCCall(repositoryPath, service);

    return new ServiceResponse<string | void>(200, {
        'Content-Type': `application/x-${service}-advertisement`,
    }, RepositoryFuncton.generateRefsServiceResponse(service, RPCCallOutput));
}

export async function rpc(repository: Readonly<Pick<Repository, 'username' | 'name'>>, command: string, headers: Readonly<any>, parameterStream: Readable): Promise<ServiceResponse<Readable | string>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null)  // 仓库不存在
    {
        return new ServiceResponse<string>(404, {}, '仓库不存在');
    }
    if (!(await RepositoryFuncton.repositoryIsAvailableToTheRequest(repositoryInDatabase, headers)))
    {
        return new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'});
    }

    if (command === 'receive-pack'
        && !(await RepositoryFuncton.repositoryIsModifiableToTheRequest(repositoryInDatabase, headers)))
    {
        return new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'});
    }

    const repositoryPath = Git.generateRepositoryPath(repository);
    const RPCCallOutputStream = Git.doRPCCall(repositoryPath, command, parameterStream);

    RPCCallOutputStream.on('close', async () =>
    {
        if (command === 'receive-pack')
        {
            await Git.doUpdateServerInfo(repositoryPath);
        }
    });

    return new ServiceResponse<Readable>(200, {
        'Content-Type': `application/x-git-${command}-result`,
    }, RPCCallOutputStream);
}