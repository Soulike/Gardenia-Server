import {IRouteHandler} from '../../Interface';
import {Session as SessionFunction} from '../../../Function';
import {InvalidSessionError, WrongParameterError} from '../../Class';
import * as ParameterValidator from './PatameterValidator';
import {PullRequest as PullRequestService} from '../../../Service';

export const add: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.add(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {
            sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
            targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
            content, title,
        } = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.add({
            sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
            targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
            content, title,
        }, username!);
    };
};

export const update: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.update(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {primaryKey, pullRequest} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.update(primaryKey, pullRequest, username!);
    };
};

export const close: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.close(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.close({id}, username!);
    };
};

export const isMergeable: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.isMergeable(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {id} = ctx.request.body;
        ctx.state.serviceResponse = await PullRequestService.isMergeable({id});
    };
};

export const merge: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.merge(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.merge({id}, username!);
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
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.get({id}, username);
    };
};

export const getByRepository: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getByRepository(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository, status} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getByRepository(repository, status, username);
    };
};

export const addComment: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.addComment(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {belongsTo, content} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse =
            await PullRequestService.addComment({belongsTo, content}, username!);
    };
};

export const updateComment: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.updateComment(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {primaryKey, pullRequestComment} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse =
            await PullRequestService.updateComment(primaryKey, pullRequestComment, username!);
    };
};

export const getComments: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getComments(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getComments({id}, username);
    };
};