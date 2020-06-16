import {IRouteHandler} from '../../Interface';
import {CodeComment} from '../../../Class';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';
import {WrongParameterError} from '../../Class';

const {CODE_COMMENT_ID, CODE_COMMENT_LINE_NUMBER} = LIMITS;

export const add: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {
            repositoryUsername, repositoryName,
            filePath, columnNumber, content, creationCommitHash,
        } = ctx.request.body;
        if (columnNumber <= 0)
        {
            throw new WrongParameterError();
        }
        if (Validator.Account.username(repositoryUsername)
            && Validator.Repository.name(repositoryName)
            && Validator.Repository.codeCommentContent(content)
            && columnNumber >= CODE_COMMENT_LINE_NUMBER.MIN
            && columnNumber <= CODE_COMMENT_LINE_NUMBER.MAX
            && CodeComment.validate(new CodeComment(0, repositoryUsername, repositoryName,
                filePath, columnNumber, content, '', creationCommitHash,
                0, 0)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const del: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {id} = ctx.request.body;
        if (id >= CODE_COMMENT_ID.MIN
            && id <= CODE_COMMENT_ID.MAX
            && CodeComment.validate(new CodeComment(id, '', '', '', 1, '', '', '', 0, 0)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const get: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {codeComment, commitHash} = ctx.request.body;
        if (codeComment === undefined || codeComment === null)
        {
            throw new WrongParameterError();
        }
        if (typeof commitHash !== 'string')
        {
            throw new WrongParameterError();
        }
        const {repositoryUsername, repositoryName, filePath, columnNumber} = codeComment;
        if (Number.isInteger(columnNumber) &&
            (columnNumber < CODE_COMMENT_LINE_NUMBER.MIN
                || columnNumber > CODE_COMMENT_LINE_NUMBER.MAX))
        {
            throw new WrongParameterError();
        }
        if (CodeComment.validate(new CodeComment(
            0,
            repositoryUsername, repositoryName, filePath,
            columnNumber ? columnNumber : 1,
            '', '', '',
            0, 0)))
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
        const {codeComment, primaryKey} = ctx.request.body;
        if (codeComment === undefined || codeComment === null
            || primaryKey === undefined || primaryKey === null)
        {
            throw new WrongParameterError();
        }
        const {content} = codeComment;
        const {id} = primaryKey;
        if (id >= CODE_COMMENT_ID.MIN
            && id <= CODE_COMMENT_ID.MAX
            && Validator.Repository.codeCommentContent(content)
            && CodeComment.validate(new CodeComment(id, '', '', '', 1, content, '', '', 0, 0)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};