import {IRouteHandler} from '../../Interface';
import * as ParameterValidator from './ParameterValidator';
import {WrongParameterError} from '../../Class';
import {Group as GroupService} from '../../../Service';

export const add: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.add(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.add(group, username!);
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
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.dismiss(group, username!);
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

export const changeName: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.changeName(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {id, name} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.changeName({id, name}, username!);
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

export const addAccount: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.addAccount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group, account} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.addAccount(group, account, username!);
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
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.addAccounts(group, usernames, username!);
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
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.removeAccounts(group, usernames, username!);
    };
};

export const getByAccount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getByAccount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.getByAccount({username});
    };
};

export const getAdministratingByAccount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getAdministratingByAccount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.getAdministratingByAccount({username});
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

export const addAdmin: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.addAdmin(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group, account} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.addAdmin(group, account, username!);
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
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.addAdmins(group, usernames, username!);
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
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.removeAdmins(group, usernames, username!);
    };
};

export const getByRepository: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getByRepository(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.getByRepository(repository, username);
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

export const addRepository: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.addRepository(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group, repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.addRepository(group, repository, username!);
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
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.removeRepositories(group, repositories, username!);
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
        const {username} = ctx.session;
        ctx.state.serviceResponse = await GroupService.isAdmin(group, username);
    };
};