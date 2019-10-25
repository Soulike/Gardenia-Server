import {Account as AccountService} from '../../../Service';
import * as ParameterValidator from './ParameterValidator';
import {IRouteHandler} from '../../Interface';
import {WrongParameterError} from '../../Class';

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