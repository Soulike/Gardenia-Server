import proxy from './Proxy';
import {responseWithAuthenticationRequirement} from '../Function';
import {MiddlewareWrapper} from '../../../Interface';

const middlewareWrapper: MiddlewareWrapper = () =>
{
    return async (ctx, next) =>
    {
        const {params} = ctx;
        const username = params[0];
        const {username: usernameInSession} = ctx.session;
        if (username === usernameInSession)
        {
            await proxy()(ctx, next);
        }
        else
        {
            responseWithAuthenticationRequirement(ctx);
        }
    };
};

export default middlewareWrapper;