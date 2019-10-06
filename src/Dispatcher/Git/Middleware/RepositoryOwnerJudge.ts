import {Middleware} from 'koa';
import proxy from './Proxy';
import {responseWithAuthenticationRequirement} from '../Function';

export default (): Middleware =>
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
}