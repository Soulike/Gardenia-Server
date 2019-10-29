import {IRouteHandler} from '../../Interface';
import * as ParameterValidator from './ParameterValidator';
import {WrongParameterError} from '../../Class';
import {Group as GroupService} from '../../../Service';

export const info: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.info(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.info(group);
    };
};

export const accounts: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.accounts(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.accounts(group);
    };
};

export const addAccounts: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.addAccounts(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {group, usernames} = ctx.request.body;
        ctx.state.serviceResponse = await GroupService.addAccounts(group, usernames);
    };
};