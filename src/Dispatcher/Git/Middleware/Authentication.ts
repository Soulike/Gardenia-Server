import Koa from 'koa';
import {Crypto, Util} from '../../../Function';
import {Account} from '../../../Database';
import repositoryOwnerJudge from './RepositoryOwnerJudge';
import {responseWithAuthenticationRequirement} from '../Function';

export default (): Koa.Middleware =>
{
    return async (ctx, next) =>
    {
        const {authorization} = ctx.request.header;
        if (typeof authorization !== 'string')
        {
            responseWithAuthenticationRequirement(ctx);
            return;
        }

        const parts = authorization.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'basic')
        {
            responseWithAuthenticationRequirement(ctx);
            return;
        }

        const decode = Util.decodeBase64(parts[1]);
        const usernameAndPasswordInBase64 = decode.split(':');
        if (usernameAndPasswordInBase64.length !== 2)
        {
            responseWithAuthenticationRequirement(ctx);
            return;
        }

        const [username, password] = usernameAndPasswordInBase64;
        const hash = Crypto.sha256(Crypto.sha256(username) + Crypto.sha256(password));
        const account = await Account.select(username);
        if (account !== null)
        {
            const {hash: expectedHash} = account;
            if (hash === expectedHash)
            {
                ctx.session = {username};
                // 移除 authorization 头部再转发
                const {authorization, ...rest} = ctx.request.headers;
                ctx.request.headers = rest;
                await repositoryOwnerJudge()(ctx, next);
            }
            else
            {
                responseWithAuthenticationRequirement(ctx);
            }
        }
        else
        {
            responseWithAuthenticationRequirement(ctx);
        }
    };
};