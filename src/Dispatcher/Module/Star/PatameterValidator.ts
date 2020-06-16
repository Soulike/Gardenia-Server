import {IRouteHandler} from '../../Interface';
import {Account, Repository} from '../../../Class';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';
import {WrongParameterError} from '../../Class';

export const add: IRouteHandler = () =>
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
            && Repository.validate(
                new Repository(username, name, '', false)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const remove: IRouteHandler = add;

export const getStaredRepositories: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {account, offset, limit} = ctx.request.body;
        if (!Number.isInteger(offset) || !Number.isInteger(limit))
        {
            throw new WrongParameterError();
        }
        if (offset < 0 || limit < 0 || limit > LIMITS.REPOSITORIES)
        {
            throw new WrongParameterError();
        }
        if (account === undefined)
        {
            return await next();
        }
        if (account === null)
        {
            throw new WrongParameterError();
        }
        const {username} = account;
        if (Validator.Account.username(username)
            && Account.validate(new Account(username, '')))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getStaredRepositoriesAmount: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {account} = ctx.request.body;
        if (account === undefined)
        {
            return await next();
        }
        if (account === null)
        {
            throw new WrongParameterError();
        }
        const {username} = account;
        if (Validator.Account.username(username)
            && Account.validate(new Account(username, '')))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const isStaredRepository: IRouteHandler = add;
export const getRepositoryStarAmount: IRouteHandler = add;
export const getRepositoryStarUsers: IRouteHandler = add;