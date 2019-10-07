import Router from '@koa/router';
import {CREATE, DEL, GET_LIST} from './ROUTE';
import koaBody from 'koa-body';
import {BODY} from '../../CONFIG';
import {Repository as RepositoryClass, ResponseBody} from '../../Class';
import {Repository as RepositoryService} from '../../Service';
import JSONQueryParameterParser from '../Middleware/JSONQueryParameterParser';

export default (router: Router) =>
{
    router.post(CREATE, koaBody(BODY), async (ctx) =>
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
    });

    router.post(DEL, koaBody(BODY), async (ctx) =>
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
    });

    router.get(GET_LIST, JSONQueryParameterParser(), async (ctx) =>
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

        const {statusCode, headers, body} = await RepositoryService.getList(start, end, ctx.session, username);
        if (headers)
        {
            ctx.response.set(headers);
        }
        ctx.response.body = body;
        ctx.response.status = statusCode;
    });
};