import body from 'koa-body';
import signale from 'signale';

export const BODY: body.IKoaBodyOptions = {
    multipart: true,
    onError: (err, ctx) =>
    {
        signale.error(err);
        ctx.response.status = 400;
    },
};