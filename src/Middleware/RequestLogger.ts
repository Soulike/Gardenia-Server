import Koa from 'koa';
import signale from 'signale';

export const requestLogger = (): Koa.Middleware =>
{
    return async (ctx, next) =>
    {
        const {method, path, query, ip} = ctx.request;
        signale.info(`${method} request from ${ip} to ${path} with query ${JSON.stringify(query)}`);
        await next();
        const {status, message, body: resBody} = ctx.response;
        signale.info(`Response to ${ip} with status ${status} ${message} and body ${JSON.stringify(resBody,
            ((_key, value) =>
            {
                if (typeof value === 'string' && value.length > 100)
                {
                    return value.slice(0, 101);
                }
                else
                {
                    return value;
                }
            }))}`);
    };
};