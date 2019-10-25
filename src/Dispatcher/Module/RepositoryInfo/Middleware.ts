import {IRouteHandler} from '../../Interface';
import {RepositoryInfo} from '../../../Service';
import * as ParameterValidator from './ParameterValidator';
import {InvalidSessionError, WrongParameterError} from '../../Class';

export const repository: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.repository(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, repositoryName} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.repository(username, repositoryName, ctx.session);
    };
};

export const branch: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.branch(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, repositoryName} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.branch(username, repositoryName, ctx.session);
    };
};

export const lastCommit: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.lastCommit(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, repositoryName, commitHash, filePath} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.lastCommit(username, repositoryName, commitHash, ctx.session, filePath);
    };
};

export const directory: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.directory(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, repositoryName, commitHash, directoryPath} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.directory(username, repositoryName, commitHash, directoryPath, ctx.session);
    };
};

export const commitCount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.commitCount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, repositoryName, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commitCount(username, repositoryName, commitHash, ctx.session);
    };
};

export const fileInfo: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.fileInfo(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, repositoryName, filePath, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.fileInfo(username, repositoryName, filePath, commitHash, ctx.session);
    };
};

export const rawFile: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.rawFile(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, repositoryName, filePath, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.rawFile(username, repositoryName, filePath, commitHash, ctx.session, ctx.res);
    };
};

export const setName: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.setName(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        if (typeof username !== 'string')
        {
            throw new InvalidSessionError();
        }
        const {repositoryName, newRepositoryName} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.setName(username, repositoryName, newRepositoryName);
    };
};

export const setDescription: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.setDescription(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        if (typeof username !== 'string')
        {
            throw new InvalidSessionError();
        }
        const {repositoryName, description} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.setDescription(username, repositoryName, description);
    };
};