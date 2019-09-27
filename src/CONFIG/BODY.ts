import body from 'koa-body';
import signale from 'signale';
import {ResponseBody} from '../Class';

export const BODY: body.IKoaBodyOptions = {
    multipart: true,
    onError: (err, ctx) =>
    {
        signale.error(err);
        ctx.response.status = 400;
        ctx.response.body = new ResponseBody(false, '请求参数错误');
    },
};