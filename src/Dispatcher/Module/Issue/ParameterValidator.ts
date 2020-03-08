import {IParameterValidator} from '../../Interface';
import {Issue, IssueComment, Repository} from '../../../Class';
import {ISSUE_STATUS} from '../../../CONSTANT';

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
    return Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, 0, title, ISSUE_STATUS.OPEN, 0, 0))
        && IssueComment.validate(new IssueComment(undefined, '', 0, content, 0, 0));
};

export const close: IParameterValidator = body =>
{
    const {repositoryUsername, repositoryName, no} = body;
    return Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, no, '', ISSUE_STATUS.OPEN, 0, 0));
};

export const reopen: IParameterValidator = close;

export const getByRepository: IParameterValidator = body =>
{
    const {repository, offset, limit} = body;
    if (repository === undefined || repository === null
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate(new Repository(username, name, '', true));
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
    return Repository.validate(new Repository(username, name, '', true));
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
    return Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, no, '', ISSUE_STATUS.OPEN, 0, 0));
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
    return Issue.validate(new Issue(undefined, '', repositoryUsername, repositoryName, no, '', ISSUE_STATUS.OPEN, 0, 0))
        && IssueComment.validate(new IssueComment(undefined, '', 0, content, 0, 0));
};