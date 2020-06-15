import {IRouteHandler} from '../../Interface';
import {PullRequest as PullRequestService} from '../../../Service';

export const add: IRouteHandler = () =>
{
    return async ctx =>
    {
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
        const {primaryKey, pullRequest} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.update(primaryKey, pullRequest, username!);
    };
};

export const close: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.close({id}, username!);
    };
};

export const reopen: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.reopen({id}, username!);
    };
};

export const isMergeable: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {id} = ctx.request.body;
        ctx.state.serviceResponse = await PullRequestService.isMergeable({id});
    };
};

export const merge: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.merge({id}, username!);
    };
};

export const get: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {repository, pullRequest} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.get(repository, pullRequest, username);
    };
};

export const getByRepository: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {repository, status, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getByRepository(repository, status, offset, limit, username);
    };
};
export const getPullRequestAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {repository, status} = ctx.request.body;
        const {username: usernameInSession} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getPullRequestAmount(repository, status, usernameInSession);
    };
};


export const addComment: IRouteHandler = () =>
{
    return async ctx =>
    {
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
        const {repository, pullRequest, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getComments(repository, pullRequest, offset, limit, username);
    };
};

export const getConflicts: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getConflicts({id}, username);
    };
};

export const resolveConflicts: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {pullRequest, conflicts} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.resolveConflicts(pullRequest, conflicts, username!);
    };
};

export const getCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {pullRequest, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getCommits(pullRequest, offset, limit, username!);
    };
};

export const getCommitAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getCommitAmount({id}, username!);
    };
};

export const getFileDiffs: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {pullRequest, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getFileDiffs(pullRequest, offset, limit, username!);
    };
};

export const getFileDiffAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await PullRequestService.getFileDiffAmount({id}, username!);
    };
};