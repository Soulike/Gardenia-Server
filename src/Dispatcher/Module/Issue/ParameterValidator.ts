import {IParameterValidator} from '../../Interface';
import {Issue, IssueComment, Repository} from '../../../Class';
import {ISSUE_STATUS} from '../../../CONSTANT';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';

const {ISSUE_NO} = LIMITS;

export const add: IParameterValidator = body =>
{
    const {issue, issueComment} = body;
    if (issue === undefined || issue === null
        || issueComment === undefined || issueComment === null)
    {
        return false;
    }
    const {repositoryUsername, repositoryName, title} = issue;
    const {content} = issueComment;
    return Validator.Account.username(repositoryUsername)
        && Validator.Repository.name(repositoryName)
        && Validator.Repository.issueTitle(title)
        && Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, 0, title, ISSUE_STATUS.OPEN, 0, 0))
        && IssueComment.validate(new IssueComment(undefined, '', 0, content, 0, 0));
};

export const close: IParameterValidator = body =>
{
    const {repositoryUsername, repositoryName, no} = body;

    return no >= ISSUE_NO.MIN
        && no <= ISSUE_NO.MAX
        && Validator.Account.username(repositoryUsername)
        && Validator.Repository.name(repositoryName)
        && Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, no, '', ISSUE_STATUS.OPEN, 0, 0));
};

export const reopen: IParameterValidator = close;

export const getByRepository: IParameterValidator = body =>
{
    const {repository, status, offset, limit} = body;
    if (repository === undefined || repository === null
        || (status !== undefined && !Object.values(ISSUE_STATUS).includes(status))
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {username, name} = repository;
    return Validator.Account.username(username)
        && Validator.Repository.name(name)
        && Repository.validate(new Repository(username, name, '', true));
};

export const getAmountByRepository: IParameterValidator = body =>
{
    const {repository, status} = body;
    if (repository === undefined || repository === null
        || (status !== undefined && !Object.values(ISSUE_STATUS).includes(status)))
    {
        return false;
    }
    const {username, name} = repository;
    return Validator.Account.username(username)
        && Validator.Repository.name(name)
        && Repository.validate(new Repository(username, name, '', true));
};

export const get: IParameterValidator = close;

export const getComments: IParameterValidator = body =>
{
    const {issue, offset, limit} = body;
    if (issue === undefined || issue === null
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {repositoryUsername, repositoryName, no} = issue;
    return no >= ISSUE_NO.MIN
        && no <= ISSUE_NO.MAX
        && Validator.Account.username(repositoryUsername)
        && Validator.Repository.name(repositoryName)
        && Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, no, '', ISSUE_STATUS.OPEN, 0, 0));
};

export const addComment: IParameterValidator = body =>
{
    const {issue, issueComment} = body;
    if (issue === undefined || issue === null
        || issueComment === undefined || issueComment === null)
    {
        return false;
    }
    const {repositoryUsername, repositoryName, no} = issue;
    const {content} = issueComment;
    return no >= ISSUE_NO.MIN
        && no <= ISSUE_NO.MAX
        && Validator.Account.username(repositoryUsername)
        && Validator.Repository.name(repositoryName)
        && Validator.Repository.issueComment(content)
        && Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, no, '', ISSUE_STATUS.OPEN, 0, 0))
        && IssueComment.validate(new IssueComment(undefined, '', 0, content, 0, 0));
};