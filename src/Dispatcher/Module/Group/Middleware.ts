import {IRouteHandler} from '../../Interface';
import * as ParameterValidator from './ParameterValidator';
import {InvalidSessionError, WrongParameterError} from '../../Class';
import {Group as GroupService} from '../../../Service';

export const add: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.add(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        if (typeof username !== 'string')
        {
            throw new InvalidSessionError();
        }
        const {group} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.add(group, ctx.session);
    };
};

export const dismiss: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.dismiss(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.dismiss(group);
    };
};

export const info: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.info(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.info(group);
    };
};

export const accounts: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.accounts(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.accounts(group);
    };
};

export const addAccounts: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.addAccounts(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group, usernames} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.addAccounts(group, usernames, ctx.session);
    };
};

export const removeAccounts: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.removeAccounts(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group, usernames} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.removeAccounts(group, usernames, ctx.session);
    };
};

export const admins: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.admins(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.admins(group);
    };
};

export const addAdmins: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.addAdmins(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group, usernames} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.addAdmins(group, usernames, ctx.session);
    };
};

export const removeAdmins: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.removeAdmins(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group, usernames} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.removeAdmins(group, usernames, ctx.session);
    };
};

export const repositories: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.repositories(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.repositories(group);
    };
};

export const removeRepositories: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.removeRepositories(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group, repositories} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.removeRepositories(group, repositories, ctx.session);
    };
};

export const isAdmin: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.isAdmin(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.isAdmin(group, ctx.session);
    };
};