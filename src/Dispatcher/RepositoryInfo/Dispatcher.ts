import Router from '@koa/router';
import {BRANCH, DIRECTORY, LAST_COMMIT, REPOSITORY} from './ROUTE';
import {ResponseBody} from '../../Class';
import {RepositoryInfo} from '../../Service';
import {getJsonParser} from '../../Middleware';

export const dispatcher = (router: Router) =>
{
    router.get(REPOSITORY, getJsonParser(), async (ctx, next) =>
    {
        try
        {
            const {username, name} = ctx.request.body;
            if (typeof username !== 'string' || typeof name !== 'string')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }
            const {statusCode, headers, body} = await RepositoryInfo.repository(username, name, ctx.session);
            if (headers)
            {
                ctx.response.set(headers);
            }
            ctx.response.body = body;
            ctx.response.status = statusCode;
        }
        finally
        {
            await next();
        }
    });

    router.get(BRANCH, getJsonParser(), async (ctx, next) =>
    {
        try
        {
            const {username, name} = ctx.request.body;
            if (typeof username !== 'string' || typeof name !== 'string')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }
            const {statusCode, headers, body} = await RepositoryInfo.branch(username, name, ctx.session);
            if (headers)
            {
                ctx.response.set(headers);
            }
            ctx.response.body = body;
            ctx.response.status = statusCode;
        }
        finally
        {
            await next();
        }
    });

    router.get(LAST_COMMIT, getJsonParser(), async (ctx, next) =>
    {
        try
        {
            const {username, name, branch} = ctx.request.body;
            if (typeof username !== 'string' || typeof name !== 'string' || typeof branch !== 'string')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }
            const {statusCode, headers, body} = await RepositoryInfo.lastCommit(username, name, branch, ctx.session);
            if (headers)
            {
                ctx.response.set(headers);
            }
            ctx.response.body = body;
            ctx.response.status = statusCode;
        }
        finally
        {
            await next();
        }
    });

    router.get(DIRECTORY, getJsonParser(), async (ctx, next) =>
    {
        try
        {
            const {username, name, branch, path} = ctx.request.body;
            if (typeof username !== 'string' || typeof name !== 'string' || typeof branch !== 'string' || typeof path !== 'string')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }
            const {statusCode, headers, body} = await RepositoryInfo.directory(username, name, branch, path, ctx.session);
            if (headers)
            {
                ctx.response.set(headers);
            }
            ctx.response.body = body;
            ctx.response.status = statusCode;
        }
        finally
        {
            await next();
        }
    });
};