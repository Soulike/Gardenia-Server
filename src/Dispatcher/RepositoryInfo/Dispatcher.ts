import Router from '@koa/router';
import {BRANCH, DIRECTORY, LAST_COMMIT, REPOSITORY} from './ROUTE';
import {ResponseBody} from '../../Class';
import {RepositoryInfo} from '../../Service/RepositoryInfo';

export const dispatcher = (router: Router) =>
{
    router.get(REPOSITORY, async (ctx, next) =>
    {
        try
        {
            const {json} = ctx.query;
            if (typeof json !== 'string')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }
            let obj = null;
            try
            {
                obj = JSON.parse(json);
            }
            catch (e)
            {
                if (e instanceof SyntaxError)
                {
                    ctx.response.status = 400;
                    ctx.response.body = new ResponseBody(false, '请求参数错误');
                    return;
                }
            }
            const {username, name} = obj;
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

    router.get(BRANCH, async (ctx, next) =>
    {
        try
        {
            const {json} = ctx.query;
            if (typeof json !== 'string')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }
            let obj = null;
            try
            {
                obj = JSON.parse(json);
            }
            catch (e)
            {
                if (e instanceof SyntaxError)
                {
                    ctx.response.status = 400;
                    ctx.response.body = new ResponseBody(false, '请求参数错误');
                    return;
                }
            }
            const {username, name} = obj;
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

    router.get(LAST_COMMIT, async (ctx, next) =>
    {
        try
        {
            const {json} = ctx.query;
            if (typeof json !== 'string')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }
            let obj = null;
            try
            {
                obj = JSON.parse(json);
            }
            catch (e)
            {
                if (e instanceof SyntaxError)
                {
                    ctx.response.status = 400;
                    ctx.response.body = new ResponseBody(false, '请求参数错误');
                    return;
                }
            }
            const {username, name, branch} = obj;
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

    router.get(DIRECTORY, async (ctx, next) =>
    {
        try
        {
            const {json} = ctx.query;
            if (typeof json !== 'string')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }
            let obj = null;
            try
            {
                obj = JSON.parse(json);
            }
            catch (e)
            {
                if (e instanceof SyntaxError)
                {
                    ctx.response.status = 400;
                    ctx.response.body = new ResponseBody(false, '请求参数错误');
                    return;
                }
            }
            const {username, name, branch, path} = obj;
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