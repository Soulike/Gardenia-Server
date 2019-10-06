import {Middleware} from 'koa';
import proxy from './Proxy';
import authentication from './Authentication';

export default (): Middleware =>
{
    return async (ctx, next) =>
    {
        const method = ctx.request.method.toUpperCase();
        const command = ctx.params[2];
        if (method === 'GET' || method === 'HEAD' || command === 'git-upload-pack')
        {
            await proxy()(ctx, next);
        }
        else
        {
            await authentication()(ctx, next);
        }
    };
}