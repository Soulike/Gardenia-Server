import {MiddlewareWrapper} from '../../Interface';
import {RepositoryInfo} from '../../../Service';
import * as ParameterValidator from './ParameterValidator';
import {WrongParameterError} from '../../Class';

export const repository: MiddlewareWrapper = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.repository(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.repository(username, name, ctx.session);
    };
};

export const branch: MiddlewareWrapper = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.branch(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.branch(username, name, ctx.session);
    };
};

export const lastCommit: MiddlewareWrapper = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.lastCommit(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, name, branch, file} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.lastCommit(username, name, branch, ctx.session, file);
    };
};

export const directory: MiddlewareWrapper = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.directory(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, name, branch, path} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.directory(username, name, branch, path, ctx.session);
    };
};

export const commitCount: MiddlewareWrapper = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.commitCount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username, name, branch} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commitCount(username, name, branch, ctx.session);
    };
};

export const fileInfo: MiddlewareWrapper = () =>
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

export const rawFile: MiddlewareWrapper = () =>
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