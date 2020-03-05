import {IRouteHandler} from '../../Interface';
import {RepositoryInfo} from '../../../Service';
import * as ParameterValidator from './ParameterValidator';
import {InvalidSessionError, WrongParameterError} from '../../Class';
import {Session as SessionFunction} from '../../../Function';

export const repository: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.repository(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {account, repository} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.repository(account, repository, ctx.session);
    };
};

export const branches: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.branches(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.branches(repository, username);
    };
};

export const branchNames: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.branchNames(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.branchNames(repository, username);
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
        const {account, repository, branch, filePath} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.lastCommit(account, repository, branch, ctx.session, filePath);
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
        const {account, repository, commitHash, directoryPath} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.directory(account, repository, commitHash, directoryPath, ctx.session);
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
        const {account, repository, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commitCount(account, repository, commitHash, ctx.session);
    };
};

export const commitCountBetweenCommits: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.commitCount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository, baseCommitHash, targetCommitHash} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.commitCountBetweenCommits(repository, baseCommitHash, targetCommitHash, username);
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
        const {account, repository, filePath, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.fileInfo(account, repository, filePath, commitHash, ctx.session);
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
        const {account, repository, filePath, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.rawFile(account, repository, filePath, commitHash, ctx.session);
    };
};

export const setName: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.setName(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository, newRepository} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.setName(repository, newRepository, ctx.session);
    };
};

export const setDescription: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.setDescription(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.setDescription(repository, ctx.session);
    };
};

export const setIsPublic: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.setIsPublic(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.setIsPublic(repository, ctx.session);
    };
};

export const groups: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        if (!ParameterValidator.groups(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.groups(repository, ctx.session);
    };
};

export const addToGroup: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!SessionFunction.isSessionValid(ctx.session))
        {
            throw new InvalidSessionError();
        }
        if (!ParameterValidator.addToGroup(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository, group} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.addToGroup(repository, group, ctx.session);
    };
};

export const commitHistoryBetweenCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.commitHistoryBetweenCommits(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        const {repository, baseCommitHash, targetCommitHash, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commitHistoryBetweenCommits(repository, baseCommitHash, targetCommitHash, offset, limit, username);
    };
};

export const commitHistory: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.commitHistory(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        const {repository, targetCommitHash, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commitHistory(repository, targetCommitHash, offset, limit, username);
    };
};

export const fileCommitHistoryBetweenCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.fileCommitHistoryBetweenCommits(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        const {repository, filePath, baseCommitHash, targetCommitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.fileCommitHistoryBetweenCommits(repository, filePath, baseCommitHash, targetCommitHash, username);
    };
};

export const fileCommitHistory: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.fileCommitHistory(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        const {repository, filePath, targetCommitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.fileCommitHistory(repository, filePath, targetCommitHash, username);
    };
};

export const diffBetweenCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.diffBetweenCommits(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        const {repository, baseCommitHash, targetCommitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.diffBetweenCommits(repository, baseCommitHash, targetCommitHash, username);
    };
};

export const fileDiffBetweenCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.fileDiffBetweenCommits(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        const {repository, filePath, baseCommitHash, targetCommitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.fileDiffBetweenCommits(repository, filePath, baseCommitHash, targetCommitHash, username);
    };
};

export const commit: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.commit(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        const {repository, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commit(repository, commitHash, username);
    };
};

export const fileCommit: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.fileCommit(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username} = ctx.session;
        const {repository, filePath, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.fileCommit(repository, filePath, commitHash, username);
    };
};

export const forkAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.forkAmount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username: usernameInSession} = ctx.session;
        const {username, name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkAmount({username, name}, usernameInSession);
    };
};

export const forkRepositories: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.forkRepositories(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username: usernameInSession} = ctx.session;
        const {username, name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkRepositories({username, name}, usernameInSession);
    };
};

export const forkFrom: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.forkFrom(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username: usernameInSession} = ctx.session;
        const {username, name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkFrom({username, name}, usernameInSession);
    };
};

export const forkCommitHistory: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.forkCommitHistory(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username: usernameInSession} = ctx.session;
        const {sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkCommitHistory(sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch, usernameInSession);
    };
};

export const forkCommitAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.forkCommitAmount(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username: usernameInSession} = ctx.session;
        const {sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkCommitAmount(sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch, usernameInSession);
    };
};

export const forkFileDiff: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.forkFileDiff(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {username: usernameInSession} = ctx.session;
        const {sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkFileDiff(sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch, usernameInSession);
    };
};