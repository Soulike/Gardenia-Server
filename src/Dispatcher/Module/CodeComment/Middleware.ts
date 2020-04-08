import {IRouteHandler} from '../../Interface';
import {InvalidSessionError, WrongParameterError} from '../../Class';
import * as ParameterValidator from './ParameterValidator';
import {CodeComment as CodeCommentService} from '../../../Service';
import {Session} from '../../../Function';

export const add: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!Session.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.add(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {
            repositoryUsername, repositoryName,
            filePath, columnNumber, content, creationCommitHash,
        } = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await CodeCommentService.add({
            repositoryUsername, repositoryName, filePath, columnNumber, content, creationCommitHash,
        }, username!);
    };
};

export const del: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!Session.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.del(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await CodeCommentService.del({id}, username!);
    };
};

export const get: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.get(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {codeComment, commitHash} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await CodeCommentService.get(codeComment, commitHash, username);
    };
};

export const update: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!Session.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.update(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {codeComment, primaryKey} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await CodeCommentService.update(codeComment, primaryKey, username!);
    };
};