import {Account as AccountService} from '../../../Service';
import * as ParameterValidator from './ParameterValidator';
import {IRouteHandler} from '../../Interface';
import {InvalidSessionError, WrongParameterError} from '../../Class';
import {Session as SessionFunction} from '../../../Function';

export const login: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.login(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, hash} = ctx.request.body;
        ctx.state.serviceResponse = await AccountService.login(
            {username, hash});
    };
};

export const register: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.register(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {
            account: {username, hash},
            profile: {nickname, avatar, email},
        } = ctx.request.body;
        ctx.state.serviceResponse = await AccountService.register(
            {username, hash}, {nickname, avatar, email});
    };
};

export const checkSession: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        ctx.state.serviceResponse = await AccountService.checkSession(ctx.session);
    };
};

export const logout: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        ctx.state.serviceResponse = await AccountService.logout();
    };
};

export const getGroups: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getGroups(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.request.body;
        ctx.state.serviceResponse = await AccountService.getGroups({username});
    };
};

export const getAdministratingGroups: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getAdministratingGroups(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.request.body;
        ctx.state.serviceResponse = await AccountService.getAdministratingGroups({username});
    };
};

export const checkPassword: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.checkPassword(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {hash} = ctx.request.body;
        ctx.state.serviceResponse = await AccountService.checkPassword({hash}, ctx.session);
    };
};