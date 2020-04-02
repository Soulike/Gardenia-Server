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
            sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
            targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName,
            content, title,
        } = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.add({
            sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
            targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName,
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

export const reopen: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.reopen(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.reopen({id}, username!);
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
        const {repository, pullRequest} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.get(repository, pullRequest, username);
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
        const {repository, status, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getByRepository(repository, status, offset, limit, username);
    };
};
export const getPullRequestAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getPullRequestAmount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository, status} = ctx.request.body;
        const {username: usernameInSession} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getPullRequestAmount(repository, status, usernameInSession);
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
        const {repository, pullRequest, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getComments(repository, pullRequest, offset, limit, username);
    };
};

export const getConflicts: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getConflicts(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getConflicts({id}, username);
    };
};

export const resolveConflicts: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.resolveConflicts(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {pullRequest, conflicts} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.resolveConflicts(pullRequest, conflicts, username!);
    };
};

export const getCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getCommits(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {pullRequest, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getCommits(pullRequest, offset, limit, username!);
    };
};

export const getCommitAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getCommitAmount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getCommitAmount({id}, username!);
    };
};

export const getFileDiffs: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getFileDiffs(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {pullRequest, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getFileDiffs(pullRequest, offset, limit, username!);
    };
};

export const getFileDiffAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getFileDiffAmount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getFileDiffAmount({id}, username!);
    };
};