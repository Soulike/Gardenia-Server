import {IRouteHandler} from '../../Interface';
import {Repository} from '../../../Class';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';
import {WrongParameterError} from '../../Class';

export const create: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {name, description, isPublic} = ctx.request.body;
        if (Validator.Repository.name(name)
            && Repository.validate({username: '', name, description, isPublic}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const del: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {name} = ctx.request.body;
        if (Validator.Repository.name(name)
            && Repository.validate({username: '', name, description: '', isPublic: true}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getRepositories: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {start, end, username} = ctx.request.body;
        if (Number.isInteger(start) && start >= 0
            && Number.isInteger(end) && end >= 0 && end - start <= LIMITS.REPOSITORIES
            && (typeof username === 'undefined'
                || (Validator.Account.username(username)
                    && Repository.validate({username, name: '', description: '', isPublic: true}))))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const fork: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {username, name} = ctx.request.body;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, isPublic: false, description: ''}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const isMergeable: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {
            sourceRepository,
            sourceRepositoryBranch,
            targetRepository,
            targetRepositoryBranch,
        } = ctx.request.body;
        if (sourceRepository === undefined || sourceRepository === null
            || typeof sourceRepositoryBranch !== 'string'
            || targetRepository === undefined || targetRepository === null
            || typeof targetRepositoryBranch !== 'string')
        {
            throw new WrongParameterError();
        }
        const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
        const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
        if (Validator.Account.username(sourceRepositoryUsername)
            && Validator.Repository.name(sourceRepositoryName)
            && Validator.Account.username(targetRepositoryUsername)
            && Validator.Repository.name(targetRepositoryName)
            && Repository.validate(new Repository(sourceRepositoryUsername, sourceRepositoryName, '', true))
            && Repository.validate(new Repository(targetRepositoryUsername, targetRepositoryName, '', true)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const search: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {keyword, offset, limit} = ctx.request.body;
        if (typeof keyword !== 'string' || keyword.length === 0
            || typeof offset !== 'number' || typeof limit !== 'number'
            || limit > LIMITS.REPOSITORIES)
        {
            throw new WrongParameterError();
        }
        else
        {
            await next();
        }
    };
};

export const shouldShowOptions: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository} = ctx.request.body;
        if (repository === undefined || repository === null)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (typeof username !== 'string' || typeof name !== 'string')
        {
            throw new WrongParameterError();
        }
        await next();
    };
};