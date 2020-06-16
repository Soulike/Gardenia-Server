import {IRouteHandler} from '../../Interface';
import {Account, Group, Repository} from '../../../Class';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';
import {WrongParameterError} from '../../Class';

const {GROUP_ID} = LIMITS;

export const add: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {group} = ctx.request.ctx.request.body;
        if (group === undefined || group === null)
        {
            throw new WrongParameterError();
        }
        const {name} = group;
        if (Validator.Group.name(name))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const dismiss: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {group} = ctx.request.body;
        if (group === undefined || group === null)
        {
            throw new WrongParameterError();
        }
        const {id} = group;
        if (id >= GROUP_ID.MIN
            && id <= GROUP_ID.MAX
            && Group.validate(new Group(id, '')))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const info = dismiss;

export const changeName: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {id, name} = ctx.request.body;
        if (id >= GROUP_ID.MIN
            && id <= GROUP_ID.MAX
            && Validator.Group.name(name)
            && Group.validate(new Group(id, name)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const accounts = dismiss;

export const addAccount: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {group, account} = ctx.request.body;
        if (group === undefined || group === null
            || account === undefined || account === null)
        {
            throw new WrongParameterError();
        }
        const {id} = group;
        const {username} = account;
        if (Group.validate({id, name: 'dad'})
            && Validator.Account.username(username))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const addAccounts: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {group, usernames} = ctx.request.body;
        if (group === undefined || group === null)
        {
            throw new WrongParameterError();
        }
        const {id} = group;
        if (!Group.validate(new Group(id, '')) || !Array.isArray(usernames))
        {
            throw new WrongParameterError();
        }
        else if (id > GROUP_ID.MAX || id < GROUP_ID.MIN)
        {
            throw new WrongParameterError();
        }
        else    // Group.validate(new Group(id, '')) && Array.isArray(usernames)
        {
            for (const username of usernames)
            {
                if (!Validator.Account.username(username))
                {
                    throw new WrongParameterError();
                }
            }
            await next();
        }
    };
};

export const removeAccounts = addAccounts;

export const getByAccount: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {username} = ctx.request.body;
        if (Validator.Account.username(username)
            && Account.validate({username, hash: ''}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getAdministratingByAccount = getByAccount;

export const admins = accounts;

export const addAdmin = addAccount;

export const addAdmins = addAccounts;

export const removeAdmins = removeAccounts;

export const getByRepository: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository} = ctx.request.body;
        if (repository === undefined || repository === null)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, description: '', isPublic: true}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const repositories = dismiss;

export const addRepository: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {group, repository} = ctx.request.body;
        if (group === undefined || group === null
            || repository === undefined || repository === null)
        {
            throw new WrongParameterError();
        }
        const {id} = group;
        const {username, name} = repository;
        if (id >= GROUP_ID.MIN
            && id <= GROUP_ID.MAX
            && Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Group.validate(new Group(id, ''))
            && Repository.validate(new Repository(username, name, '', false)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const removeRepositories: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {group, repositories} = ctx.request.body;
        if (group === undefined || group === null)
        {
            throw new WrongParameterError();
        }
        const {id} = group;
        if (!Group.validate(new Group(id, '')) || !Array.isArray(repositories))
        {
            throw new WrongParameterError();
        }
        else if (id > GROUP_ID.MAX || id < GROUP_ID.MIN)
        {
            throw new WrongParameterError();
        }
        else    // Group.validate(new Group(id, '')) && Array.isArray(repositories)
        {
            for (const repository of repositories)
            {
                const {username, name} = repository;
                if (!Validator.Account.username(username) || !Validator.Repository.name(name))
                {
                    throw new WrongParameterError();
                }
            }
            await next();
        }
    };
};

export const isAdmin = dismiss;