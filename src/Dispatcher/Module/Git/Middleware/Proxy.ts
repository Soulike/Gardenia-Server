import {AddressInfo} from 'net';
import proxy from 'koa-better-http-proxy';
import {GitHTTPCgiServer} from '../../../../Class';
import {IRouteHandler} from '../../../Interface';

const middlewareWrapper: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const server = await GitHTTPCgiServer.getCgiServer();
        const port = (server.address() as AddressInfo).port;
        await proxy(`localhost`, {
            port,
            preserveHostHdr: true,
            preserveReqSession: true,
            parseReqBody: false,
        })(ctx, next);
    };
};

export default middlewareWrapper;