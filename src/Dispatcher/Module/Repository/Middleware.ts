import {IRouteHandler} from '../../Interface';
import {Repository as RepositoryService} from '../../../Service';
import * as ParameterValidator from './ParameterValidator';
import {WrongParameterError} from '../../Class';

export const create: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.create(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {name, description, isPublic} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryService.create({name, description, isPublic}, username!);
    };
};

export const del: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.del(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {name} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryService.del({name}, username!);
    };
};

export const getRepositories: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getRepositories(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {start, end, username} = ctx.request.body;
        const {username: usernameInSession} = ctx.session;
        ctx.state.serviceResponse = await RepositoryService.getRepositories(start, end, username, usernameInSession);
    };
};

export const fork: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username: usernameInSession} = ctx.session;
        if (!ParameterValidator.fork(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryService.fork({username, name}, usernameInSession!);
    };
};

export const isMergeable: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.isMergeable(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username: usernameInSession} = ctx.session;
        const {
            sourceRepository,
            sourceRepositoryBranch,
            targetRepository,
            targetRepositoryBranch,
        } = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryService.isMergeable(sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch, usernameInSession);
    };
};