import {IRouteHandler} from '../../Interface';
import {InvalidSessionError} from '../../Class';
import {Collaborate as CollaborateService} from '../../../Service';

export const generateCode: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse =
            await CollaborateService.generateCode(repository, username);
    };
};

export const add: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        const {code} = ctx.request.body;
        ctx.state.serviceResponse =
            await CollaborateService.add(code, username!);
    };
};

export const remove: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        const {repository, account} = ctx.request.body;
        ctx.state.serviceResponse =
            await CollaborateService.remove(repository, account, username!);
    };
};

export const getCollaborators: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse =
            await CollaborateService.getCollaborators(repository, username);
    };
};

export const getCollaboratorsAmount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username} = ctx.session;
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse =
            await CollaborateService.getCollaboratorsAmount(repository, username);
    };
};

export const getCollaboratingRepositories: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {account} = ctx.request.body;
        const {username} = ctx.session;
        if (account === undefined)
        {
            if (typeof username !== 'string')
            {
                throw new InvalidSessionError();
            }
            ctx.state.serviceResponse =
                await CollaborateService.getCollaboratingRepositories({username}, username);
        }
        else
        {
            ctx.state.serviceResponse =
                await CollaborateService.getCollaboratingRepositories(account, username);
        }
    };
};

export const getCollaboratingRepositoriesAmount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {account} = ctx.request.body;
        if (account === undefined)
        {
            const {username} = ctx.session;
            if (typeof username !== 'string')
            {
                throw new InvalidSessionError();
            }
            ctx.state.serviceResponse =
                await CollaborateService.getCollaboratingRepositoriesAmount({username});
        }
        else
        {
            ctx.state.serviceResponse =
                await CollaborateService.getCollaboratingRepositoriesAmount(account);
        }
    };
};