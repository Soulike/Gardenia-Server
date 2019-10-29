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