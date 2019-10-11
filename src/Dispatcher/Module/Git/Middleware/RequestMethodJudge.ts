import proxy from './Proxy';
import authentication from './Authentication';
import {MiddlewareWrapper} from '../../../Interface';

const middlewareWrapper: MiddlewareWrapper = () =>
{
    return async (ctx, next) =>
    {
        const method = ctx.request.method.toUpperCase();
        const command = ctx.params[2];
        if (method === 'GET' || method === 'HEAD' || command === 'git-upload-pack')
        {
            await proxy()(ctx, next);
        }
        else
        {
            await authentication()(ctx, next);
        }
    };
};

export default middlewareWrapper;