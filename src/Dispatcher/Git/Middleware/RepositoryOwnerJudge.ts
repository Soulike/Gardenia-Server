import {Middleware} from 'koa';
import proxy from './Proxy';

export default (): Middleware =>
{
    return async (ctx, next) =>
    {
        const {params} = ctx;
        const username = params[0];
        const {username: usernameInSession} = ctx.session;
        if (username === usernameInSession)
        {
            await proxy()(ctx, next);
        }
        else
        {
            ctx.response.status = 404;
            ctx.response.body = '仓库不存在';
        }
    };
}