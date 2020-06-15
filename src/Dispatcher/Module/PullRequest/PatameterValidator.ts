import {IRouteHandler} from '../../Interface';
import {Conflict, PullRequest, PullRequestComment, Repository} from '../../../Class';
import {PULL_REQUEST_STATUS} from '../../../CONSTANT';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';
import {WrongParameterError} from '../../Class';

const {PULL_REQUEST_ID, PULL_REQUEST_NO, PULL_REQUEST_COMMENT_ID} = LIMITS;

export const add: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {
            sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
            targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName,
            content, title,
        } = ctx.request.body;
        if (Validator.Account.username(sourceRepositoryUsername)
            && Validator.Repository.name(sourceRepositoryName)
            && Validator.Account.username(targetRepositoryUsername)
            && Validator.Repository.name(targetRepositoryName)
            && Validator.Repository.pullRequestTitle(title)
            && PullRequest.validate(new PullRequest(
                undefined, 1,
                sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName, '',
                targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName, '',
                0, 0, title, content, PULL_REQUEST_STATUS.OPEN)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const update: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {primaryKey, pullRequest} = ctx.request.body;
        if (primaryKey === undefined || pullRequest === undefined
            || primaryKey === null || pullRequest === null)
        {
            throw new WrongParameterError();
        }
        const {id} = primaryKey;
        const {title, content} = pullRequest;
        if (id !== undefined
            && id >= PULL_REQUEST_ID.MIN
            && id <= PULL_REQUEST_ID.MAX
            && Validator.Repository.pullRequestTitle(title)
            && PullRequest.validate(new PullRequest(id, 0,
                '', '', '', '',
                '', '', '', '',
                0, 0, title, content, PULL_REQUEST_STATUS.OPEN)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const close: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {id} = ctx.request.body;
        if (id !== undefined
            && id >= PULL_REQUEST_ID.MIN
            && id <= PULL_REQUEST_ID.MAX
            && PullRequest.validate(new PullRequest(id, 0,
                '', '', '', '',
                '', '', '', '',
                0, 0, '', '', PULL_REQUEST_STATUS.OPEN)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const reopen: IRouteHandler = close;
export const isMergeable: IRouteHandler = close;
export const merge: IRouteHandler = close;

export const get: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {pullRequest, repository} = ctx.request.body;
        if (pullRequest === undefined || pullRequest === null
            || repository === undefined || repository === null)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        const {no} = pullRequest;
        if (no >= PULL_REQUEST_NO.MIN
            && no <= PULL_REQUEST_NO.MAX
            && Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate(new Repository(username, name, '', false))
            && PullRequest.validate(new PullRequest(undefined, no, '', '', '', '', '', '', '', '', 0, 0, '', '', PULL_REQUEST_STATUS.OPEN)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getByRepository: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, status, offset, limit} = ctx.request.body;
        if (repository === undefined || repository === null
            || (status !== undefined && !Object.values(PULL_REQUEST_STATUS).includes(status)))
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.PULL_REQUESTS)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate(new Repository(username, name, '', true)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getPullRequestAmount: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, status} = ctx.request.body;
        if (repository === undefined || repository === null
            || (status !== undefined && !Object.values(PULL_REQUEST_STATUS).includes(status)))
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate(new Repository(username, name, '', true)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const addComment: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {belongsTo, content} = ctx.request.body;
        if (belongsTo >= PULL_REQUEST_ID.MIN
            && belongsTo <= PULL_REQUEST_ID.MAX
            && Validator.Repository.pullRequestComment(content)
            && PullRequestComment.validate(new PullRequestComment(
                undefined, '', belongsTo, content, 0, 0)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const updateComment: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {primaryKey, pullRequestComment} = ctx.request.body;
        if (primaryKey === undefined || pullRequestComment === undefined
            || primaryKey === null || pullRequestComment === null)
        {
            throw new WrongParameterError();
        }
        const {id} = primaryKey;
        const {content} = pullRequestComment;
        if (id !== undefined
            && id >= PULL_REQUEST_COMMENT_ID.MIN
            && id <= PULL_REQUEST_COMMENT_ID.MAX
            && Validator.Repository.pullRequestComment(content)
            && PullRequestComment.validate(new PullRequestComment(
                id, '', 0, content, 0, 0)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getComments: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {pullRequest, repository, offset, limit} = ctx.request.body;
        if (pullRequest === undefined || pullRequest === null
            || repository === undefined || repository === null)
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.PULL_REQUEST_COMMENTS)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        const {no} = pullRequest;
        if (no >= PULL_REQUEST_NO.MIN
            && no <= PULL_REQUEST_NO.MAX
            && Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate(new Repository(username, name, '', false))
            && PullRequest.validate(new PullRequest(undefined, no, '', '', '', '', '', '', '', '', 0, 0, '', '', PULL_REQUEST_STATUS.OPEN)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getConflicts: IRouteHandler = close;

export const resolveConflicts: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {pullRequest, conflicts} = ctx.request.body;
        if (pullRequest === undefined || pullRequest === null || !Array.isArray(conflicts))
        {
            throw new WrongParameterError();
        }
        const {id} = pullRequest;
        if (id === undefined || !PullRequest.validate(new PullRequest(id, 0,
            '', '', '', '',
            '', '', '', '',
            0, 0, '', '', PULL_REQUEST_STATUS.OPEN)))
        {
            throw new WrongParameterError();
        }
        if (id > PULL_REQUEST_ID.MAX || id < PULL_REQUEST_ID.MIN)
        {
            throw new WrongParameterError();
        }
        for (const conflict of conflicts)
        {
            if (!Conflict.validate(conflict))
            {
                throw new WrongParameterError();
            }
        }
        await next();
    };
};

export const getCommits: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {pullRequest, offset, limit} = ctx.request.body;
        if (pullRequest === undefined || pullRequest === null)
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.COMMIT)
        {
            throw new WrongParameterError();
        }
        const {id} = pullRequest;
        if (id !== undefined
            && id >= PULL_REQUEST_ID.MIN
            && id <= PULL_REQUEST_ID.MAX
            && PullRequest.validate(new PullRequest(id, 0,
                '', '', '', '',
                '', '', '', '',
                0, 0, '', '', PULL_REQUEST_STATUS.OPEN)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getCommitAmount: IRouteHandler = close;

export const getFileDiffs: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {pullRequest, offset, limit} = ctx.request.body;
        if (pullRequest === undefined || pullRequest === null)
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.DIFF)
        {
            throw new WrongParameterError();
        }
        const {id} = pullRequest;
        if (id !== undefined
            && id >= PULL_REQUEST_ID.MIN
            && id <= PULL_REQUEST_ID.MAX
            && PullRequest.validate(new PullRequest(id, 0,
                '', '', '', '',
                '', '', '', '',
                0, 0, '', '', PULL_REQUEST_STATUS.OPEN)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getFileDiffAmount: IRouteHandler = close;