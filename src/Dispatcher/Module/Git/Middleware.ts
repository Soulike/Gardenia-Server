import {IRouteHandler} from '../../Interface';
import {Git} from '../../../Service';

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
        ctx.state.serviceResponse = await Git.rpc(
            {username, name: repositoryName},
            command, ctx.request.headers, ctx.req);
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