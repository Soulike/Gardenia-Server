import {Account, Profile} from '../../../Class';
import {IRouteHandler} from '../../Interface';
import Validator from '../../Validator';
import {WrongParameterError} from '../../Class';

export const login: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {username, hash} = ctx.request.body;
        if (Validator.Account.username(username)
            && Validator.Account.hash(hash)
            && Account.validate({username, hash}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const register: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {account, profile, verificationCode} = ctx.request.body;
        const {username, hash} = account;
        const {nickname, email} = profile;
        if (Validator.Account.username(username)
            && Validator.Account.hash(hash)
            && Validator.Profile.nickname(nickname)
            && Validator.Profile.email(email)
            && Account.validate(account)
            && Profile.validate({username: '', ...profile})
            && Validator.Account.verificationCode(verificationCode))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const checkIfUsernameAvailable: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {username} = ctx.request.body;
        if (Validator.Account.username(username))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const sendVerificationCodeByUsername: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {username} = ctx.request.body;
        if (Validator.Account.username(username)
            && Profile.validate(new Profile(username, '', 'a@b.com', '')))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const sendVerificationCodeToEmail: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {email} = ctx.request.body;
        if (Validator.Profile.email(email)
            && Profile.validate(new Profile('', '', email, '')))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const changePassword: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {account, verificationCode} = ctx.request.body;
        if (account === undefined || account === null)
        {
            throw new WrongParameterError();
        }
        const {username, hash} = account;
        if (Validator.Account.username(username)
            && Validator.Account.hash(hash)
            && Validator.Account.verificationCode(verificationCode)
            && Account.validate(new Account(username, hash)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const checkPassword: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {hash} = ctx.request.body;
        if (Validator.Account.hash(hash)
            && Account.validate({username: '', hash}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};