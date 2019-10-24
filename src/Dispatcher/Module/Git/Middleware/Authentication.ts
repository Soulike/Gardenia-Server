import {Account} from '../../../../Database';
import repositoryOwnerJudge from './RepositoryOwnerJudge';
import {responseWithAuthenticationRequirement} from '../Function';
import {IRouteHandler} from '../../../Interface';
import {Account as AccountClass} from '../../../../Class';
import {Base64} from 'js-base64';

const middlewareWrapper: IRouteHandler = () =>
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

        const decode = Base64.decode(parts[1]);
        const usernameAndPasswordInBase64 = decode.split(':');
        if (usernameAndPasswordInBase64.length !== 2)
        {
            responseWithAuthenticationRequirement(ctx);
            return;
        }

        const [username, password] = usernameAndPasswordInBase64;
        const hash = AccountClass.calculateHash(username, password);
        const account = await Account.select(username);
        if (account !== null)
        {
            const {hash: expectedHash} = account;
            if (hash === expectedHash)
            {
                Object.assign(ctx.session, {username});
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

export default middlewareWrapper;