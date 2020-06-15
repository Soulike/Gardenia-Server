import {IRouteHandler} from '../../Interface';
import {InvalidSessionError} from '../../Class';
import {Star as StarService} from '../../../Service';

export const add: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await StarService.add(repository, username!);
    };
};

export const remove: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await StarService.remove(repository, username!);
    };
};

export const getStaredRepositories: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {account, offset, limit} = ctx.request.body;
        if (account !== undefined)
        {
            const {username} = account;
            ctx.state.serviceResponse =
                await StarService.getStartedRepositories(username, offset, limit);
        }
        else    // account === undefined
        {
            const {username} = ctx.session;
            if (typeof username !== 'string')
            {
                throw new InvalidSessionError();
            }
            ctx.state.serviceResponse =
                await StarService.getStartedRepositories(username, offset, limit);
        }
    };
};

export const getStaredRepositoriesAmount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
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
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await StarService.isStaredRepository(repository, username);
    };
};

export const getRepositoryStarAmount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await StarService.getRepositoryStarAmount(repository, username);
    };
};

export const getRepositoryStarUsers: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await StarService.getRepositoryStarUsers(repository, username);
    };
};