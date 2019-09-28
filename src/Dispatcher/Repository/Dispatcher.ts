import Router from '@koa/router';
import {CREATE, DEL, GET_FILE, GET_PERSONAL_LIST, GET_PUBLIC_LIST} from './ROUTE';
import koaBody from 'koa-body';
import {BODY} from '../../CONFIG';
import {Repository as RepositoryClass, ResponseBody} from '../../Class';
import {Repository as RepositoryService} from '../../Service';
import {getJsonParser} from '../../Middleware';

export const dispatcher = (router: Router) =>
{
    router.post(CREATE, koaBody(BODY), async (ctx, next) =>
    {
        try
        {
            const {username: usernameInSession} = ctx.session;
            const {username, name, description, isPublic} = ctx.request.body;
            if (typeof username !== 'string' ||
                typeof name !== 'string' ||
                typeof description !== 'string' ||
                typeof isPublic !== 'boolean')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
            }
            else if (username !== usernameInSession)
            {
                ctx.response.status = 403;
                ctx.response.body = new ResponseBody(false, '不允许创建在其他人名下的仓库');
            }
            else
            {
                const repository = new RepositoryClass(username, name, description, isPublic);
                const {statusCode, headers, body} = await RepositoryService.create(repository);
                if (headers)
                {
                    ctx.response.set(headers);
                }
                ctx.response.body = body;
                ctx.response.status = statusCode;
            }
        }
        finally
        {
            await next();
        }
    });

    router.post(DEL, koaBody(BODY), async (ctx, next) =>
    {
        try
        {
            const {name} = ctx.request.body;
            if (typeof name !== 'string')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }

            const {username} = ctx.session;
            if (typeof username !== 'string')
            {
                ctx.response.status = 403;
                ctx.response.body = new ResponseBody(false, '未登录操作');
                return;
            }

            const {statusCode, headers, body} = await RepositoryService.del(username, name);
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

    router.get(GET_FILE, getJsonParser(), async (ctx, next) =>
    {
        try
        {
            const {username, repositoryName, filePath, hash} = ctx.request.body;
            if (typeof username !== 'string' ||
                typeof repositoryName !== 'string' ||
                typeof filePath !== 'string' ||
                typeof hash !== 'string')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }

            const {statusCode, headers, body} = await RepositoryService.getFile(username, repositoryName, filePath, hash, ctx.session);
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

    router.get(GET_PUBLIC_LIST, getJsonParser(), async (ctx, next) =>
    {
        try
        {
            const {start, end, username} = ctx.request.body;
            if (typeof start !== 'number' ||
                typeof end !== 'number' ||
                (typeof username !== 'undefined' && typeof username !== 'string'))
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }

            const {statusCode, headers, body} = await RepositoryService.getPublicList(start, end, username);
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

    router.get(GET_PERSONAL_LIST, getJsonParser(), async (ctx, next) =>
    {
        try
        {
            const {username} = ctx.session;

            if (typeof username !== 'string')
            {
                ctx.response.status = 403;
                ctx.response.body = new ResponseBody(false, '您未登录');
                return;
            }

            const {start, end} = ctx.request.body;
            if (typeof start !== 'number' ||
                typeof end !== 'number')
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody(false, '请求参数错误');
                return;
            }

            const {statusCode, headers, body} = await RepositoryService.getPersonalList(username, start, end);
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