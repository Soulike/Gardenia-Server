import {MiddlewareWrapper} from '../../Interface';
import {ResponseBody} from '../../../Class';
import {Repository as RepositoryService} from '../../../Service';
import * as ParameterValidator from './ParameterValidator';
import {WrongParameterError} from '../../Class';

export const create: MiddlewareWrapper = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.create(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username: usernameInSession} = ctx.session;
        const {username, name, description, isPublic} = ctx.request.body;
        if (username !== usernameInSession)
        {
            ctx.response.status = 403;
            ctx.response.body = new ResponseBody(false, '不允许创建在其他人名下的仓库');
            return;
        }
        ctx.state.serviceResponse = await RepositoryService.create({username, name, description, isPublic});
    };
};

export const del: MiddlewareWrapper = () =>
{
    return async (ctx) =>
    {
        if (ParameterValidator.del(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repositoryName} = ctx.request.body;
        const {username} = ctx.session;
        if (typeof username !== 'string')
        {
            ctx.response.status = 403;
            ctx.response.body = new ResponseBody(false, '未登录操作');
            return;
        }

        ctx.state.serviceResponse = await RepositoryService.del(username, repositoryName);
    };
};

export const getList: MiddlewareWrapper = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getList(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {start, end, username} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryService.getList(start, end, ctx.session, username);
    };
};