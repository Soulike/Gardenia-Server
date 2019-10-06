import Koa from 'koa';

export function responseWithAuthenticationRequirement(ctx: Koa.ParameterizedContext)
{
    ctx.response.status = 401;
    ctx.response.set({
        'WWW-Authenticate': 'Basic realm=git',
    });
}