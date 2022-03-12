import {Profile} from '../../../Service';
import {IRouteHandler} from '../../Interface';
import {File} from 'formidable';

export const get: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {account} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await Profile.get(username, account);
    };
};

export const getByEmail: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {email} = ctx.request.body;
        ctx.state.serviceResponse = await Profile.getByEmail(email);
    };
};

export const setNickname: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {nickname} = ctx.request.body;
        const {username: usernameInSession} = ctx.session;
        ctx.state.serviceResponse = await Profile.setNickname(nickname, usernameInSession!);
    };
};

export const setEmail: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {email, verificationCode} = ctx.request.body;
        const {username, verification} = ctx.session;
        ctx.state.serviceResponse = await Profile.setEmail(email, verificationCode, username!, verification);
    };
};

export const sendSetEmailVerificationCodeToEmail: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {email} = ctx.request.body;
        ctx.state.serviceResponse = await Profile.sendSetEmailVerificationCodeToEmail(email);
    };
};


export const uploadAvatar: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {avatar} = ctx.request.files!;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await Profile.uploadAvatar(
            avatar as Readonly<File>,   // ensured by ParameterValidator
            username!);
    };
};

export const search: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {keyword, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await Profile.search(keyword, offset, limit);
    };
};