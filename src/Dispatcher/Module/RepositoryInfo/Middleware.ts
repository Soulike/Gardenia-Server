import {IRouteHandler} from '../../Interface';
import {RepositoryInfo} from '../../../Service';

export const repository: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {account, repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.repository(account, repository, username);
    };
};

export const branches: IRouteHandler = () =>
{
    return async (ctx) =>
    {

        const {repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.branches(repository, username);
    };
};

export const branchNames: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.branchNames(repository, username);
    };
};

export const tagNames: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.tagNames(repository, username);
    };
};

export const lastBranchCommit: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {account, repository, branch, filePath} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.lastBranchCommit(account, repository, branch, filePath, username);
    };
};

export const lastCommit: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.lastCommit(repository, username);
    };
};

export const directory: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {account, repository, commitHash, directoryPath} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.directory(account, repository, commitHash, directoryPath, username);
    };
};

export const commitCount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {account, repository, commitHash} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.commitCount(account, repository, commitHash, username);
    };
};

export const commitCountBetweenCommits: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {repository, baseCommitHash, targetCommitHash} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.commitCountBetweenCommits(repository, baseCommitHash, targetCommitHash, username);
    };
};

export const fileInfo: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {account, repository, filePath, commitHash} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.fileInfo(account, repository, filePath, commitHash, username);
    };
};

export const rawFile: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {account, repository, filePath, commitHash} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.rawFile(account, repository, filePath, commitHash, username);
    };
};

export const setName: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {repository, newRepository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.setName(repository, newRepository, username!);
    };
};

export const setDescription: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.setDescription(repository, username!);
    };
};

export const setIsPublic: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {repository} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await RepositoryInfo.setIsPublic(repository, username!);
    };
};

export const commitHistoryBetweenCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, baseCommitHash, targetCommitHash, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commitHistoryBetweenCommits(repository, baseCommitHash, targetCommitHash, offset, limit, username);
    };
};

export const commitHistory: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, targetCommitHash, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commitHistory(repository, targetCommitHash, offset, limit, username);
    };
};

export const fileCommitHistoryBetweenCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, filePath, baseCommitHash, targetCommitHash, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.fileCommitHistoryBetweenCommits(repository, filePath, baseCommitHash, targetCommitHash, offset, limit, username);
    };
};

export const fileCommitHistory: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, filePath, targetCommitHash, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.fileCommitHistory(repository, filePath, targetCommitHash, offset, limit, username);
    };
};

export const diffBetweenCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, baseCommitHash, targetCommitHash, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.diffBetweenCommits(repository, baseCommitHash, targetCommitHash, offset, limit, username);
    };
};

export const diffAmountBetweenCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, baseCommitHash, targetCommitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.diffAmountBetweenCommits(repository, baseCommitHash, targetCommitHash, username);
    };
};

export const fileDiffBetweenCommits: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, filePath, baseCommitHash, targetCommitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.fileDiffBetweenCommits(repository, filePath, baseCommitHash, targetCommitHash, username);
    };
};

export const commit: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commit(repository, commitHash, username);
    };
};

export const commitDiff: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, commitHash, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commitDiff(repository, commitHash, offset, limit, username);
    };
};

export const commitDiffAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.commitDiffAmount(repository, commitHash, username);
    };
};

export const fileCommit: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username} = ctx.session;
        const {repository, filePath, commitHash} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.fileCommit(repository, filePath, commitHash, username);
    };
};

export const forkAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username: usernameInSession} = ctx.session;
        const {username, name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkAmount({username, name}, usernameInSession);
    };
};

export const forkRepositories: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username: usernameInSession} = ctx.session;
        const {username, name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkRepositories({username, name}, usernameInSession);
    };
};

export const forkFrom: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username: usernameInSession} = ctx.session;
        const {username, name} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkFrom({username, name}, usernameInSession);
    };
};

export const forkCommitHistory: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username: usernameInSession} = ctx.session;
        const {sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkCommitHistory(sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch, offset, limit, usernameInSession);
    };
};

export const forkCommitAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username: usernameInSession} = ctx.session;
        const {sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkCommitAmount(sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch, usernameInSession);
    };
};

export const forkFileDiff: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username: usernameInSession} = ctx.session;
        const {sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch, offset, limit} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkFileDiff(sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch, offset, limit, usernameInSession);
    };
};

export const forkFileDiffAmount: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username: usernameInSession} = ctx.session;
        const {sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.forkFileDiffAmount(sourceRepository, sourceRepositoryBranch, targetRepository, targetRepositoryBranch, usernameInSession);
    };
};

export const hasCommonAncestor: IRouteHandler = () =>
{
    return async ctx =>
    {
        const {username: usernameInSession} = ctx.session;
        const {sourceRepository, sourceRepositoryBranchName, targetRepository, targetRepositoryBranchName} = ctx.request.body;
        ctx.state.serviceResponse = await RepositoryInfo.hasCommonAncestor(sourceRepository, sourceRepositoryBranchName, targetRepository, targetRepositoryBranchName, usernameInSession);
    };
};