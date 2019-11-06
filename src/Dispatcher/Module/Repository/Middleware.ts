import {IRouteHandler} from '../../Interface';
import {Repository as RepositoryService} from '../../../Service';
import * as ParameterValidator from './ParameterValidator';
import {WrongParameterError} from '../../Class';

export const create: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.create(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {name, description, isPublic} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryService.create({
            name,
            description,
            isPublic,
        }, ctx.session);
    };
};

export const del: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.del(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryService.del({name}, ctx.session);
    };
};

export const getRepositories: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.getRepositories(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {start, end, username} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryService.getRepositories(start, end, ctx.session, username);
    };
};