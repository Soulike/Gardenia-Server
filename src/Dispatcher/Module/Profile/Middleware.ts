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