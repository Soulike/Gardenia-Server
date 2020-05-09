import {IParameterValidator} from '../../Interface';
import {CodeComment} from '../../../Class';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';

const {CODE_COMMENT_ID, CODE_COMMENT_LINE_NUMBER} = LIMITS;

export const add: IParameterValidator = body =>
{
    const {
        repositoryUsername, repositoryName,
        filePath, columnNumber, content, creationCommitHash,
    } = body;
    if (columnNumber <= 0)
    {
        return false;
    }
    return Validator.Account.username(repositoryUsername)
        && Validator.Repository.name(repositoryName)
        && Validator.Repository.codeCommentContent(content)
        && columnNumber >= CODE_COMMENT_LINE_NUMBER.MIN
        && columnNumber <= CODE_COMMENT_LINE_NUMBER.MAX
        && CodeComment.validate(new CodeComment(0, repositoryUsername, repositoryName,
            filePath, columnNumber, content, '', creationCommitHash,
            0, 0));
};

export const del: IParameterValidator = body =>
{
    const {id} = body;
    return id >= CODE_COMMENT_ID.MIN
        && id <= CODE_COMMENT_ID.MAX
        && CodeComment.validate(new CodeComment(id, '', '', '', 1, '', '', '', 0, 0));
};

export const get: IParameterValidator = body =>
{
    const {codeComment, commitHash} = body;
    if (codeComment === undefined || codeComment === null)
    {
        return false;
    }
    if (typeof commitHash !== 'string')
    {
        return false;
    }
    const {repositoryUsername, repositoryName, filePath, columnNumber} = codeComment;
    return columnNumber >= CODE_COMMENT_LINE_NUMBER.MIN
        && columnNumber <= CODE_COMMENT_LINE_NUMBER.MAX
        && CodeComment.validate(new CodeComment(0, repositoryUsername, repositoryName, filePath, columnNumber ? columnNumber : 1, '', '', '', 0, 0));
};

export const update: IParameterValidator = body =>
{
    const {codeComment, primaryKey} = body;
    if (codeComment === undefined || codeComment === null
        || primaryKey === undefined || primaryKey === null)
    {
        return false;
    }
    const {content} = codeComment;
    const {id} = primaryKey;
    return id >= CODE_COMMENT_ID.MIN
        && id <= CODE_COMMENT_ID.MAX
        && Validator.Repository.codeCommentContent(content)
        && CodeComment.validate(new CodeComment(id, '', '', '', 1, content, '', '', 0, 0));
};