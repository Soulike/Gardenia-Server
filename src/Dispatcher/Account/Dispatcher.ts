import Router from '@koa/router';
import {LOGIN} from './ROUTE';
import koaBody from 'koa-body';
import {BODY} from '../../CONFIG';
import {ResponseBody} from '../../Class';
import {Account as AccountService} from '../../Service';

export const dispatcher = (router: Router) =>
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
                const {statusCode, headers, body} = await AccountService.login(username, hash);
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