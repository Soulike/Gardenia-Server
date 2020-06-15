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
            verificationCode,
        } = ctx.request.body;
        ctx.state.serviceResponse = await AccountService.register(
            {username, hash}, {nickname, avatar, email}, verificationCode, ctx.session.verification);
    };
};

export const checkIfUsernameAvailable: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.checkIfUsernameAvailable(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.request.body;
        ctx.state.serviceResponse = await AccountService.checkIfUsernameAvailable(username);
    };
};

export const sendVerificationCodeByUsername: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.sendVerificationCodeByUsername(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.request.body;
        ctx.state.serviceResponse = await AccountService.sendVerificationCodeByUsername({username});
    };
};

export const sendVerificationCodeToEmail: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.sendVerificationCodeToEmail(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {email} = ctx.request.body;
        ctx.state.serviceResponse = await AccountService.sendVerificationCodeToEmail({email});
    };
};

export const changePassword: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.changePassword(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {account, verificationCode} = ctx.request.body;
        const {verification} = ctx.session;
        ctx.state.serviceResponse = await AccountService.changePassword(account, verificationCode, verification);
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

export const checkPassword: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.checkPassword(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {hash} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await AccountService.checkPassword({hash}, username!);
    };
};