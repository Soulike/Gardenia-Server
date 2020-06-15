import {IRouteHandler} from '../../Interface';
import {Issue, IssueComment, Repository} from '../../../Class';
import {ISSUE_STATUS} from '../../../CONSTANT';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';
import {WrongParameterError} from '../../Class';

const {ISSUE_NO} = LIMITS;

export const add: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {issue, issueComment} = ctx.request.body;
        if (issue === undefined || issue === null
            || issueComment === undefined || issueComment === null)
        {
            throw new WrongParameterError();
        }
        const {repositoryUsername, repositoryName, title} = issue;
        const {content} = issueComment;
        if (Validator.Account.username(repositoryUsername)
            && Validator.Repository.name(repositoryName)
            && Validator.Repository.issueTitle(title)
            && Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, 0, title, ISSUE_STATUS.OPEN, 0, 0))
            && IssueComment.validate(new IssueComment(undefined, '', 0, content, 0, 0)))
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
        const {repositoryUsername, repositoryName, no} = ctx.request.body;
        if (no >= ISSUE_NO.MIN
            && no <= ISSUE_NO.MAX
            && Validator.Account.username(repositoryUsername)
            && Validator.Repository.name(repositoryName)
            && Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, no, '', ISSUE_STATUS.OPEN, 0, 0)))
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

export const getByRepository: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, status, offset, limit} = ctx.request.body;
        if (repository === undefined || repository === null
            || (status !== undefined && !Object.values(ISSUE_STATUS).includes(status)))
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.ISSUES)
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

export const getAmountByRepository: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, status} = ctx.request.body;
        if (repository === undefined || repository === null
            || (status !== undefined && !Object.values(ISSUE_STATUS).includes(status)))
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

export const get: IRouteHandler = close;

export const getComments: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {issue, offset, limit} = ctx.request.body;
        if (issue === undefined || issue === null)
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.ISSUE_COMMENTS)
        {
            throw new WrongParameterError();
        }
        const {repositoryUsername, repositoryName, no} = issue;
        if (no >= ISSUE_NO.MIN
            && no <= ISSUE_NO.MAX
            && Validator.Account.username(repositoryUsername)
            && Validator.Repository.name(repositoryName)
            && Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, no, '', ISSUE_STATUS.OPEN, 0, 0)))
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
        const {issue, issueComment} = ctx.request.body;
        if (issue === undefined || issue === null
            || issueComment === undefined || issueComment === null)
        {
            throw new WrongParameterError();
        }
        const {repositoryUsername, repositoryName, no} = issue;
        const {content} = issueComment;
        if (no >= ISSUE_NO.MIN
            && no <= ISSUE_NO.MAX
            && Validator.Account.username(repositoryUsername)
            && Validator.Repository.name(repositoryName)
            && Validator.Repository.issueComment(content)
            && Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, no, '', ISSUE_STATUS.OPEN, 0, 0))
            && IssueComment.validate(new IssueComment(undefined, '', 0, content, 0, 0)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};