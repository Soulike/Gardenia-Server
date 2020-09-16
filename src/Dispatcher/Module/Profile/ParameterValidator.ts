import {IRouteHandler} from '../../Interface';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';
import {WrongParameterError} from '../../Class';

export const get: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {account} = ctx.request.body;
        if (typeof account === 'undefined' || account === null)
        {
            return await next();
        }
        const {username} = account;
        if (typeof username === 'string')    // 这里不用 validate 方法是因为允许 username 是任何字符串
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getByEmail: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {email} = ctx.request.body;
        if (typeof email === 'string') // 这里不用 validate 方法是因为允许 email 是不是邮箱的字符串
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const setNickname: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {nickname} = ctx.request.body;
        if (Validator.Profile.nickname(nickname))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const setEmail: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {email, verificationCode} = ctx.request.body;
        if (Validator.Profile.email(email) && typeof verificationCode === 'string')
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const sendSetEmailVerificationCodeToEmail: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {email} = ctx.request.body;
        if (Validator.Profile.email(email))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const uploadAvatar: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        if (ctx.request.files === undefined || ctx.request.files === null)
        {
            throw new WrongParameterError();
        }
        const {avatar} = ctx.request.files; // 这里的 avatar 是 File 类型
        if (typeof avatar === 'undefined' || avatar === null)
        {
            throw new WrongParameterError();
        }
        // 限制文件的类型和尺寸
        const {size, type} = avatar;
        if (typeof type === 'string'
            && LIMITS.AVATAR_MIME_TYPES.includes(type)
            && size <= LIMITS.AVATAR_SIZE)
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const search: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {keyword} = ctx.request.body;
        if (typeof keyword !== 'string' || keyword.length === 0)
        {
            throw new WrongParameterError();
        }
        else
        {
            await next();
        }
    };
};