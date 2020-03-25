import {IRouteHandler} from '../../Interface';
import * as ParameterValidator from './PatameterValidator';
import {InvalidSessionError, WrongParameterError} from '../../Class';
import {Star as StarService} from '../../../Service';

export const add: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        if (typeof username !== 'string')
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.add(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await StarService.add(repository, username);
    };
};

export const remove: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        if (typeof username !== 'string')
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.remove(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await StarService.remove(repository, username);
    };
};

export const getStaredRepositories: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getStaredRepositories(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {account} = ctx.request.body;
        if (account !== undefined)
        {
            const {username} = account;
            ctx.state.serviceResponse =
                await StarService.getStartedRepositories(username);
        }
        else    // account === undefined
        {
            const {username} = ctx.session;
            if (typeof username !== 'string')
            {
                throw new InvalidSessionError();
            }
            ctx.state.serviceResponse =
                await StarService.getStartedRepositories(username);
        }
    };
};

export const getStaredRepositoriesAmount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getStaredRepositoriesAmount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {account} = ctx.request.body;
        if (account !== undefined)
        {
            const {username} = account;
            ctx.state.serviceResponse =
                await StarService.getStaredRepositoriesAmount(username);
        }
        else    // account === undefined
        {
            const {username} = ctx.session;
            if (typeof username !== 'string')
            {
                throw new InvalidSessionError();
            }
            ctx.state.serviceResponse =
                await StarService.getStaredRepositoriesAmount(username);
        }
    };
};

export const isStaredRepository: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        if (!ParameterValidator.isStaredRepository(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await StarService.isStaredRepository(repository, username);
    };
};

export const getRepositoryStarAmount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getRepositoryStarAmount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await StarService.getRepositoryStarAmount(repository, username);
    };
};

export const getRepositoryStarUsers: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getRepositoryStarUsers(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await StarService.getRepositoryStarUsers(repository, username);
    };
};