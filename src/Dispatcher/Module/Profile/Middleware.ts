import {Profile} from '../../../Service';
import {IRouteHandler} from '../../Interface';
import * as ParameterValidator from './ParameterValidator';
import {InvalidSessionError, WrongParameterError} from '../../Class';
import {Session as SessionFunction} from '../../../Function';

export const get: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.get(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {account} = ctx.request.body;
        ctx.state.serviceResponse = await Profile.get(ctx.session, account);
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

export const set: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.set(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {avatar, username, ...rest} = ctx.request.body;
        ctx.state.serviceResponse = await Profile.set(rest, ctx.session);
    };
};

export const uploadAvatar: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (typeof ctx.request.files === 'undefined' || !ParameterValidator.uploadAvatar(ctx.request.files))
        {
            throw new WrongParameterError();
        }
        const {avatar} = ctx.request.files;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await Profile.uploadAvatar(avatar, username!);
    };
};