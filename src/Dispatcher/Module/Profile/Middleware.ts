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
        ctx.state.serviceResponse = await Profile.get(ctx.session, account);
    };
};

export const set: IRouteHandler = () =>
{
    return async ctx =>
    {
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
        if (typeof ctx.request.files === 'undefined' || !ParameterValidator.uploadAvatar(ctx.request.files))
        {
            throw new WrongParameterError();
        }
        const {avatar} = ctx.request.files;
        ctx.state.serviceResponse = await Profile.updateAvatar(avatar, ctx.session);
    };
};