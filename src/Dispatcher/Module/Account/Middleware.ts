import {Account as AccountService} from '../../../Service';
import * as ParameterValidator from './ParameterValidator';
import {MiddlewareWrapper} from '../../Interface';
import {WrongParameterError} from '../../Class';

export const login: MiddlewareWrapper = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.login(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, hash} = ctx.request.body;
        ctx.state.serviceResponse = await AccountService.login(
            {username, hash}, ctx.session);
    };
};

export const register: MiddlewareWrapper = () =>
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

export const checkSession: MiddlewareWrapper = () =>
{
    return async (ctx) =>
    {
        ctx.state.serviceResponse = await AccountService.checkSession(ctx.session);
    };
};