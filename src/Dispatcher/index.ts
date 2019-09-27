import {router} from './Router';
import Koa from 'koa';
import signale from 'signale';
import {ResponseBody} from '../Class';

export const dispatcher = (app: Koa): Koa.Middleware =>
{
    app
        .use(router.routes())
        .use(router.allowedMethods());

    return async (ctx, next) =>
    {
        try
        {
            await next();
        }
        catch (e)
        {
            ctx.response.status = 500;
            ctx.response.body = new ResponseBody(false, '服务器错误');
            signale.error(e);
        }
    };
};