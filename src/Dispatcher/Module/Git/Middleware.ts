import {IRouteHandler} from '../../Interface';
import {Git} from '../../../Service';
import zlib from 'zlib';
import {Readable} from 'stream';

export const advertise: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {service} = ctx.request.query;
        if (typeof service !== 'string')
        {
            ctx.response.status = 400;
        }
        else
        {
            const {0: username, 1: repositoryName} = ctx.params;
            ctx.state.serviceResponse = await Git.advertise(
                {username, name: repositoryName},
                service, ctx.request.headers);
        }
    };
};

export const rpc: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {0: username, 1: repositoryName, 2: command} = ctx.params;
        let readableStream: Readable = ctx.req;
        const {'content-encoding': contentEncoding} = ctx.request.headers;
        if (contentEncoding === 'gzip')  // git 在大仓库可能会进行压缩
        {
            const gunzip = zlib.createGunzip();
            readableStream = ctx.req.pipe(gunzip);
        }
        ctx.state.serviceResponse = await Git.rpc(
            {username, name: repositoryName},
            command, ctx.request.headers, readableStream);
    };
};

export const file: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {0: username, 1: repositoryName, 2: filePath} = ctx.params;
        ctx.state.serviceResponse = await Git.file(
            {username, name: repositoryName},
            filePath,
            ctx.request.headers);
    };
};