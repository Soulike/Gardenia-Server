import {IParameterValidator} from '../../Interface';
import {Conflict, PullRequest, PullRequestComment, Repository} from '../../../Class';
import {PULL_REQUEST_STATUS} from '../../../CONSTANT';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';

const {PULL_REQUEST_ID, PULL_REQUEST_NO, PULL_REQUEST_COMMENT_ID} = LIMITS;

export const add: IParameterValidator = body =>
{
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName,
        content, title,
    } = body;
    return Validator.Account.username(sourceRepositoryUsername)
        && Validator.Repository.name(sourceRepositoryName)
        && Validator.Account.username(targetRepositoryUsername)
        && Validator.Repository.name(targetRepositoryName)
        && Validator.Repository.pullRequestTitle(title)
        && PullRequest.validate(new PullRequest(
            undefined, 1,
            sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName, '',
            targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName, '',
            0, 0, title, content, PULL_REQUEST_STATUS.OPEN,
        ));
};

export const update: IParameterValidator = body =>
{
    const {primaryKey, pullRequest} = body;
    if (primaryKey === undefined || pullRequest === undefined
        || primaryKey === null || pullRequest === null)
    {
        return false;
    }
    const {id} = primaryKey;
    const {title, content} = pullRequest;
    return id !== undefined
        && id >= PULL_REQUEST_ID.MIN
        && id <= PULL_REQUEST_ID.MAX
        && Validator.Repository.pullRequestTitle(title)
        && PullRequest.validate(new PullRequest(id, 0,
            '', '', '', '',
            '', '', '', '',
            0, 0, title, content, PULL_REQUEST_STATUS.OPEN));
};

export const close: IParameterValidator = body =>
{
    const {id} = body;
    return id !== undefined
        && id >= PULL_REQUEST_ID.MIN
        && id <= PULL_REQUEST_ID.MAX
        && PullRequest.validate(new PullRequest(id, 0,
            '', '', '', '',
            '', '', '', '',
            0, 0, '', '', PULL_REQUEST_STATUS.OPEN));
};

export const reopen: IParameterValidator = close;
export const isMergeable: IParameterValidator = close;
export const merge: IParameterValidator = close;
export const get: IParameterValidator = body =>
{
    const {pullRequest, repository} = body;
    if (pullRequest === undefined || pullRequest === null
        || repository === undefined || repository === null)
    {
        return false;
    }
    const {username, name} = repository;
    const {no} = pullRequest;
    return no >= PULL_REQUEST_NO.MIN
        && no <= PULL_REQUEST_NO.MAX
        && Validator.Account.username(username)
        && Validator.Repository.name(name)
        && Repository.validate(new Repository(username, name, '', false))
        && PullRequest.validate(new PullRequest(undefined, no, '', '', '', '', '', '', '', '', 0, 0, '', '', PULL_REQUEST_STATUS.OPEN));
};

export const getByRepository: IParameterValidator = body =>
{
    const {repository, status, offset, limit} = body;
    if (repository === undefined || repository === null
        || (status !== undefined && !Object.values(PULL_REQUEST_STATUS).includes(status))
        || typeof offset !== 'number' || typeof limit !== 'number')
    {
        return false;
    }
    const {username, name} = repository;
    return Validator.Account.username(username)
        && Validator.Repository.name(name)
        && Repository.validate(new Repository(username, name, '', true));
};

export const getPullRequestAmount: IParameterValidator = body =>
{
    const {repository, status} = body;
    if (repository === undefined || repository === null
        || (status !== undefined && !Object.values(PULL_REQUEST_STATUS).includes(status)))
    {
        return false;
    }
    const {username, name} = repository;
    return Validator.Account.username(username)
        && Validator.Repository.name(name)
        && Repository.validate(new Repository(username, name, '', true));
};

export const addComment: IParameterValidator = body =>
{
    const {belongsTo, content} = body;
    return belongsTo >= PULL_REQUEST_ID.MIN
        && belongsTo <= PULL_REQUEST_ID.MAX
        && Validator.Repository.pullRequestComment(content)
        && PullRequestComment.validate(new PullRequestComment(
            undefined, '', belongsTo, content, 0, 0,
        ));
};

export const updateComment: IParameterValidator = body =>
{
    const {primaryKey, pullRequestComment} = body;
    if (primaryKey === undefined || pullRequestComment === undefined
        || primaryKey === null || pullRequestComment === null)
    {
        return false;
    }
    const {id} = primaryKey;
    const {content} = pullRequestComment;
    return id !== undefined
        && id >= PULL_REQUEST_COMMENT_ID.MIN
        && id <= PULL_REQUEST_COMMENT_ID.MAX
        && Validator.Repository.pullRequestComment(content)
        && PullRequestComment.validate(new PullRequestComment(
            id, '', 0, content, 0, 0,
        ));
};

export const getComments: IParameterValidator = body =>
{
    const {pullRequest, repository, offset, limit} = body;
    if (pullRequest === undefined || pullRequest === null
        || repository === undefined || repository === null
        || (offset !== undefined && typeof offset !== 'number')
        || (limit !== undefined && typeof limit !== 'number'))
    {
        return false;
    }
    if (offset < 0 || limit < 0)
    {
        return false;
    }
    const {username, name} = repository;
    const {no} = pullRequest;
    return no >= PULL_REQUEST_NO.MIN
        && no <= PULL_REQUEST_NO.MAX
        && Validator.Account.username(username)
        && Validator.Repository.name(name)
        && Repository.validate(new Repository(username, name, '', false))
        && PullRequest.validate(new PullRequest(undefined, no, '', '', '', '', '', '', '', '', 0, 0, '', '', PULL_REQUEST_STATUS.OPEN));
};

export const getConflicts: IParameterValidator = close;

export const resolveConflicts: IParameterValidator = body =>
{
    const {pullRequest, conflicts} = body;
    if (pullRequest === undefined || pullRequest === null || !Array.isArray(conflicts))
    {
        return false;
    }
    const {id} = pullRequest;
    if (id === undefined || !PullRequest.validate(new PullRequest(id, 0,
        '', '', '', '',
        '', '', '', '',
        0, 0, '', '', PULL_REQUEST_STATUS.OPEN)))
    {
        return false;
    }
    if (id > PULL_REQUEST_ID.MAX || id < PULL_REQUEST_ID.MIN)
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

export const getCommits: IParameterValidator = body =>
{
    const {pullRequest, offset, limit} = body;
    if (pullRequest === undefined || pullRequest === null
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {id} = pullRequest;
    return id !== undefined
        && id >= PULL_REQUEST_ID.MIN
        && id <= PULL_REQUEST_ID.MAX
        && PullRequest.validate(new PullRequest(id, 0,
            '', '', '', '',
            '', '', '', '',
            0, 0, '', '', PULL_REQUEST_STATUS.OPEN));
};
export const getCommitAmount: IParameterValidator = close;
export const getFileDiffs: IParameterValidator = getCommits;
export const getFileDiffAmount: IParameterValidator = close;