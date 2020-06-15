import {Profile} from '../../../Service';
import {IRouteHandler} from '../../Interface';
import * as ParameterValidator from './ParameterValidator';
import {WrongParameterError} from '../../Class';

export const get: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.get(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {account} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await Profile.get(username, account);
    };
};

export const getByEmail: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getByEmail(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {email} = ctx.request.body;
        ctx.state.serviceResponse = await Profile.getByEmail(email);
    };
};

export const setNickname: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.setNickname(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {nickname} = ctx.request.body;
        const {username: usernameInSession} = ctx.session;
        ctx.state.serviceResponse = await Profile.setNickname(nickname, usernameInSession!);
    };
};

export const setEmail: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.setEmail(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {email, verificationCode} = ctx.request.body;
        const {username, verification} = ctx.session;
        ctx.state.serviceResponse = await Profile.setEmail(email, verificationCode, username!, verification);
    };
};

export const sendSetEmailVerificationCodeToEmail: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.sendSetEmailVerificationCodeToEmail(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {email} = ctx.request.body;
        ctx.state.serviceResponse = await Profile.sendSetEmailVerificationCodeToEmail(email);
    };
};


export const uploadAvatar: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (typeof ctx.request.files === 'undefined' || !ParameterValidator.uploadAvatar(ctx.request.files))
        {
            throw new WrongParameterError();
        }
        const {avatar} = ctx.request.files;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await Profile.uploadAvatar(avatar, username!);
    };
};