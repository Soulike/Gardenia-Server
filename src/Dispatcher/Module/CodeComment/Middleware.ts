import {IRouteHandler} from '../../Interface';
import {CodeComment as CodeCommentService} from '../../../Service';

export const add: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {
            repositoryUsername, repositoryName,
            filePath, columnNumber, content, creationCommitHash,
        } = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await CodeCommentService.add({
            repositoryUsername, repositoryName, filePath, columnNumber, content, creationCommitHash,
        }, username!);
    };
};

export const del: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {id} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await CodeCommentService.del({id}, username!);
    };
};

export const get: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {codeComment, commitHash} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await CodeCommentService.get(codeComment, commitHash, username);
    };
};

export const update: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {codeComment, primaryKey} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await CodeCommentService.update(codeComment, primaryKey, username!);
    };
};