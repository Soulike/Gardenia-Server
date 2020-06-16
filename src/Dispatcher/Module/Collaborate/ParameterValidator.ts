import {IRouteHandler} from '../../Interface';
import {Account, Repository} from '../../../Class';
import Validator from '../../Validator';
import {WrongParameterError} from '../../Class';

export const generateCode: IRouteHandler = () =>
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
            && Repository.validate({username, name, description: '', isPublic: false}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const add: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {code} = ctx.request.body;
        if (Validator.Collaborator.code(code))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const remove: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, account} = ctx.request.body;
        if (repository === undefined || repository === null
            || account === undefined || account === null)
        {
            throw new WrongParameterError();
        }
        const {username: usernameOfRepository, name} = repository;
        const {username} = account;
        if (Validator.Account.username(usernameOfRepository)
            && Validator.Repository.name(name)
            && Validator.Account.username(username)
            && Repository.validate({username: usernameOfRepository, name, isPublic: false, description: ''})
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

export const getCollaborators: IRouteHandler = generateCode;
export const getCollaboratorsAmount: IRouteHandler = generateCode;

export const getCollaboratingRepositories: IRouteHandler = () =>
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

export const getCollaboratingRepositoriesAmount: IRouteHandler = getCollaboratingRepositories;