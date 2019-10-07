import Router from '@koa/router';
import {GET} from './ROUTE';
import JSONQueryParameterParser from '../Middleware/JSONQueryParameterParser';
import {ResponseBody} from '../../Class';
import {Profile} from '../../Service';

export default (router: Router) =>
{
    router.get(GET, JSONQueryParameterParser(), async (ctx) =>
    {
        let {username} = ctx.request.body;
        if (typeof username !== 'string')
        {
            username = ctx.session.username;
        }
        if (typeof username !== 'string')
        {
            ctx.response.status = 400;
            ctx.response.body = new ResponseBody<void>(false, '请求参数错误');
            return;
        }
        const {statusCode, headers, body} = await Profile.get(username);
        if (headers)
        {
            ctx.response.set(headers);
        }
        ctx.response.body = body;
        ctx.response.status = statusCode;
    });
};