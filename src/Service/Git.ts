import fs from 'fs';
import {Repository as RepositoryFunction} from '../Function';
import mime from 'mime-types';
import {Repository, ServiceResponse} from '../Class';
import path from 'path';
import {Repository as RepositoryTable} from '../Database';
import {Readable} from 'stream';
import {doAdvertiseRPCCall, doRPCCall, doUpdateServerInfo, getBranchNames, updateRelatedPullRequest} from '../Git';

export async function file(repository: Readonly<Pick<Repository, 'username' | 'name'>>, filePath: string, headers: Readonly<any>): Promise<ServiceResponse<Readable | string>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null)  // 仓库不存在
    {
        return new ServiceResponse<string>(404, {}, '仓库不存在');
    }
    if (!(await RepositoryFunction.repositoryIsReadableToTheRequest(repositoryInDatabase, headers)))
    {
        return new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'});
    }

    return new Promise(resolve =>
    {
        const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
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
    if (!(await RepositoryFunction.repositoryIsReadableToTheRequest(repositoryInDatabase, headers)))
    {
        return new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'});
    }
    if (service === 'git-receive-pack'
        && !(await RepositoryFunction.repositoryIsModifiableToTheRequest(repositoryInDatabase, headers)))
    {
        return new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'});
    }

    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const RPCCallOutput = await doAdvertiseRPCCall(repositoryPath, service);

    return new ServiceResponse<string | void>(200, {
        'Content-Type': `application/x-${service}-advertisement`,
    }, RepositoryFunction.generateRefsServiceResponse(service, RPCCallOutput));
}

export async function rpc(repository: Readonly<Pick<Repository, 'username' | 'name'>>, command: string, headers: Readonly<any>, parameterStream: Readable): Promise<ServiceResponse<Readable | string>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null)  // 仓库不存在
    {
        return new ServiceResponse<string>(404, {}, '仓库不存在');
    }
    if (!(await RepositoryFunction.repositoryIsReadableToTheRequest(repositoryInDatabase, headers)))
    {
        return new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'});
    }

    if (command === 'receive-pack'
        && !(await RepositoryFunction.repositoryIsModifiableToTheRequest(repositoryInDatabase, headers)))
    {
        return new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'});
    }

    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const prevBranchNames = await getBranchNames(repositoryPath);
    const RPCCallOutputStream = await doRPCCall(repositoryPath, command, parameterStream);
    RPCCallOutputStream.on('close', async () =>
    {
        if (command === 'receive-pack')
        {
            await doUpdateServerInfo(repositoryPath);
            await updateRelatedPullRequest(repository);
            // 检查是不是有分支被删除，关闭相关 PR
            const branchNames = await getBranchNames(repositoryPath);
            if (branchNames.length !== prevBranchNames.length)
            {
                await Promise.all(prevBranchNames.map(async branchName =>
                {
                    if (!branchNames.includes(branchName))
                    {
                        await RepositoryFunction.closePullRequestWithBranch(repository, branchName);
                    }
                }));
            }
        }
    });
    return new ServiceResponse<Readable>(200, {
        'Content-Type': `application/x-git-${command}-result`,
    }, RPCCallOutputStream);
}