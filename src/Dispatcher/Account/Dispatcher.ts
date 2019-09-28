import Router from '@koa/router';
import {LOGIN, REGISTER} from './ROUTE';
import koaBody from 'koa-body';
import {BODY} from '../../CONFIG';
import {ResponseBody} from '../../Class';
import {Account as AccountService} from '../../Service';
import validator from 'validator';

export default (router: Router) =>
{
    router.post(LOGIN, koaBody(BODY), async (ctx, next) =>
    {
        try
        {
            const {username, hash} = ctx.request.body;
            if (typeof username !== 'string' || typeof hash !== 'string' || hash.length !== 64)
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody<void>(false, '请求参数错误');
            }
            else
            {
                const {statusCode, headers, body} = await AccountService.login(username, hash, ctx.session);
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

    router.post(REGISTER, koaBody(BODY), async (ctx, next) =>
    {
        try
        {
            const {username, hash, email} = ctx.request.body;
            if (typeof username !== 'string' || typeof hash !== 'string' || hash.length !== 64 ||
                typeof email !== 'string' || !validator.isEmail(email))
            {
                ctx.response.status = 400;
                ctx.response.body = new ResponseBody<void>(false, '请求参数错误');
            }
            else
            {
                const {statusCode, headers, body} = await AccountService.register(username, hash, email);
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
};