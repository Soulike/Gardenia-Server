import {IRouteHandler} from '../../Interface';
import {Repository as RepositoryService} from '../../../Service';

export const create: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {name, description, isPublic} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryService.create({name, description, isPublic}, username!);
    };
};

export const del: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {name} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryService.del({name}, username!);
    };
};

export const getRepositories: IRouteHandler = () =>
{
    return async (ctx) =>
    {
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
        const {username, name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryService.fork({username, name}, usernameInSession!);
    };
};

export const isMergeable: IRouteHandler = () =>
{
    return async ctx =>
    {
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

export const search: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {keyword, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryService.search(keyword, offset, limit);
    };
};