import {IParameterValidator} from '../../Interface';
import {Conflict, PullRequest, PullRequestComment, Repository} from '../../../Class';
import {PULL_REQUEST_STATUS} from '../../../CONSTANT';

export const add: IParameterValidator = body =>
{
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
        content, title,
    } = body;
    return PullRequest.validate(new PullRequest(
        undefined, 1,
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
        0, 0, title, content, PULL_REQUEST_STATUS.OPEN,
    ));
};

export const update: IParameterValidator = body =>
{
    const {primaryKey, pullRequest} = body;
    if (primaryKey === null || pullRequest === null)
    {
        return false;
    }
    const {id} = primaryKey;
    if (id === undefined)
    {
        return false;
    }
    const {title, content} = pullRequest;
    return PullRequest.validate(new PullRequest(id, 0,
        '', '', '',
        '', '', '',
        0, 0, title, content, PULL_REQUEST_STATUS.OPEN));
};

export const close: IParameterValidator = body =>
{
    const {id} = body;
    if (id === undefined)
    {
        return false;
    }
    return PullRequest.validate(new PullRequest(id, 0,
        '', '', '',
        '', '', '',
        0, 0, '', '', PULL_REQUEST_STATUS.OPEN));
};

export const reopen: IParameterValidator = close;
export const isMergeable: IParameterValidator = close;
export const merge: IParameterValidator = close;
export const get: IParameterValidator = close;

export const getByRepository: IParameterValidator = body =>
{
    const {repository, status} = body;
    if (repository === null
        || (status !== undefined && !Object.values(PULL_REQUEST_STATUS).includes(status)))
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate(new Repository(username, name, '', true));
};

export const getOpenPullRequestAmount: IParameterValidator = body =>
{
    const {username, name} = body;
    return Repository.validate(new Repository(username, name, '', false));
};

export const addComment: IParameterValidator = body =>
{
    const {belongsTo, content} = body;
    return PullRequestComment.validate(new PullRequestComment(
        undefined, '', belongsTo, content, 0, 0,
    ));
};

export const updateComment: IParameterValidator = body =>
{
    const {primaryKey, pullRequestComment} = body;
    if (primaryKey === null || pullRequestComment === null)
    {
        return false;
    }
    const {id} = primaryKey;
    const {content} = pullRequestComment;
    if (id === undefined)
    {
        return false;
    }
    return PullRequestComment.validate(new PullRequestComment(
        id, '', 0, content, 0, 0,
    ));
};

export const getComments: IParameterValidator = body =>
{
    const {pullRequest} = body;
    if (pullRequest === null)
    {
        return false;
    }
    const {id} = pullRequest;
    if (id === undefined)
    {
        return false;
    }
    return PullRequestComment.validate(new PullRequestComment(
        id, '', 0, '', 0, 0,
    ));
};

export const getConflicts: IParameterValidator = close;

export const resolveConflicts: IParameterValidator = body =>
{
    const {pullRequest, conflicts} = body;
    if (pullRequest === null || !Array.isArray(conflicts))
    {
        return false;
    }
    const {id} = pullRequest;
    if (id === undefined || !PullRequest.validate(new PullRequest(id, 0,
        '', '', '',
        '', '', '',
        0, 0, '', '', PULL_REQUEST_STATUS.OPEN)))
    {
        return false;
    }
    for (const conflict of conflicts)
    {
        if (!Conflict.validate(conflict))
        {
            return false;
        }
    }
    return true;
};