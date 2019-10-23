import {Profile} from '../../../Service';
import {IRouteHandler} from '../../Interface';
import * as ParameterValidator from './ParameterValidator';
import {WrongParameterError} from '../../Class';

export const get: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {username: usernameInSession} = ctx.session;
        if (!ParameterValidator.get(ctx.request.body) && typeof usernameInSession !== 'string')
        {
            throw new WrongParameterError();
        }
        let {username} = ctx.request.body;
        if (typeof username === 'undefined')
        {
            username = ctx.session.username;
        }
        ctx.state.serviceResponse = await Profile.get(username);
    };
};