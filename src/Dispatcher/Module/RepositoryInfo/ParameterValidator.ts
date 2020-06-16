import {IRouteHandler} from '../../Interface';
import {Account, Repository} from '../../../Class';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';
import {WrongParameterError} from '../../Class';

export const repository: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {account, repository} = ctx.request.body;
        if (typeof account === 'undefined' || account === null
            || typeof repository === 'undefined' || repository === null)
        {
            throw new WrongParameterError();
        }
        else
        {
            const {username} = account;
            const {name} = repository;
            if (Validator.Account.username(username)
                && Validator.Repository.name(name)
                && Account.validate({username, hash: 'a'.repeat(64)})
                && Repository.validate({name, isPublic: true, description: '', username: ''}))
            {
                await next();
            }
            else
            {
                throw new WrongParameterError();
            }
        }
    };
};

export const branches: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository} = ctx.request.body;
        if (repository === undefined || repository === null)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, isPublic: true, description: ''}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const branchNames: IRouteHandler = branches;

export const lastBranchCommit: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {account, repository, branch, filePath} = ctx.request.body;
        if (typeof account === 'undefined' || account === null
            || typeof repository === 'undefined' || repository === null)
        {
            throw new WrongParameterError();
        }
        const {username} = account;
        const {name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Account.validate({username, hash: 'a'.repeat(64)})
            && Repository.validate({name, isPublic: true, description: '', username: ''})
            && typeof branch === 'string'
            && (typeof filePath === 'undefined' || typeof filePath === 'string'))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const lastCommit: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository} = ctx.request.body;
        if (repository === undefined || repository === null)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate(new Repository(username, name, '', false)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const directory: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {account, repository, commitHash, directoryPath} = ctx.request.body;
        if (typeof account === 'undefined' || account === null
            || typeof repository === 'undefined' || repository === null)
        {
            throw new WrongParameterError();
        }
        const {username} = account;
        const {name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Account.validate({username, hash: 'a'.repeat(64)})
            && Repository.validate({name, isPublic: true, description: '', username: ''})
            && typeof commitHash === 'string'
            && typeof directoryPath === 'string')
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const commitCount: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {account, repository, commitHash} = ctx.request.body;
        if (typeof account === 'undefined' || account === null
            || typeof repository === 'undefined' || repository === null)
        {
            throw new WrongParameterError();
        }
        const {username} = account;
        const {name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Account.validate({username, hash: 'a'.repeat(64)})
            && Repository.validate({name, isPublic: true, description: '', username: ''})
            && typeof commitHash === 'string')
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const commitCountBetweenCommits: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, baseCommitHash, targetCommitHash} = ctx.request.body;
        if (typeof repository === 'undefined' || repository === null
            || typeof baseCommitHash !== 'string' || typeof targetCommitHash !== 'string')
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({name, isPublic: true, description: '', username}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const fileInfo: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {account, repository, filePath, commitHash} = ctx.request.body;
        if (typeof account === 'undefined' || account === null
            || typeof repository === 'undefined' || repository === null)
        {
            throw new WrongParameterError();
        }
        const {username} = account;
        const {name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Account.validate({username, hash: 'a'.repeat(64)})
            && Repository.validate({name, isPublic: true, description: '', username: ''})
            && typeof filePath === 'string'
            && typeof commitHash === 'string')
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const rawFile = fileInfo;

export const setName: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, newRepository} = ctx.request.body;
        if (typeof newRepository === 'undefined' || newRepository === null
            || typeof repository === 'undefined' || repository === null)
        {
            throw new WrongParameterError();
        }
        const {name} = repository;
        const {name: newName} = newRepository;
        if (Validator.Repository.name(name)
            && Validator.Repository.name(newName)
            && Repository.validate({name, isPublic: true, description: '', username: ''})
            && Repository.validate({name: newName, isPublic: true, description: '', username: ''}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const setDescription: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository} = ctx.request.body;
        if (typeof repository === 'undefined' || repository === null)
        {
            throw new WrongParameterError();
        }
        const {name, description} = repository;
        if (Validator.Repository.name(name)
            && Repository.validate({name, description, username: '', isPublic: true}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const setIsPublic: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository} = ctx.request.body;
        if (typeof repository === 'undefined' || repository === null)
        {
            throw new WrongParameterError();
        }
        const {name, isPublic} = repository;
        if (Validator.Repository.name(name)
            && Repository.validate({name, isPublic, username: '', description: ''}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const commitHistoryBetweenCommits: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, baseCommitHash, targetCommitHash, offset, limit} = ctx.request.body;
        if (repository === undefined || repository === null
            || typeof baseCommitHash !== 'string'
            || typeof targetCommitHash !== 'string')
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.COMMIT)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, description: '', isPublic: false}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const commitHistory: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, targetCommitHash, offset, limit} = ctx.request.body;
        if (repository === undefined || repository === null
            || typeof targetCommitHash !== 'string')
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.COMMIT)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, description: '', isPublic: false}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const fileCommitHistoryBetweenCommits: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, filePath, baseCommitHash, targetCommitHash, offset, limit} = ctx.request.body;
        if (repository === undefined || repository === null
            || typeof filePath !== 'string'
            || typeof baseCommitHash !== 'string'
            || typeof targetCommitHash !== 'string')
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.COMMIT)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, description: '', isPublic: false}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const fileCommitHistory: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, filePath, targetCommitHash, offset, limit} = ctx.request.body;
        if (repository === undefined || repository === null
            || typeof filePath !== 'string'
            || typeof targetCommitHash !== 'string')
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.COMMIT)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, description: '', isPublic: false}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const diffBetweenCommits: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, baseCommitHash, targetCommitHash, offset, limit} = ctx.request.body;
        if (repository === undefined || repository === null
            || typeof baseCommitHash !== 'string'
            || typeof targetCommitHash !== 'string')
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.DIFF)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, description: '', isPublic: false}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const diffAmountBetweenCommits: IRouteHandler = diffBetweenCommits;

export const fileDiffBetweenCommits: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, filePath, baseCommitHash, targetCommitHash} = ctx.request.body;
        if (repository === undefined || repository === null
            || typeof filePath !== 'string'
            || typeof baseCommitHash !== 'string'
            || typeof targetCommitHash !== 'string')
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, description: '', isPublic: false}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const commit: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, commitHash} = ctx.request.body;
        if (repository === undefined || repository === null || typeof commitHash !== 'string')
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, isPublic: true, description: ''}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const commitDiff: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, commitHash, offset, limit} = ctx.request.body;
        if (repository === undefined || repository === null
            || typeof commitHash !== 'string')
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.DIFF)
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, isPublic: true, description: ''}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const commitDiffAmount: IRouteHandler = commit;

export const fileCommit: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {repository, filePath, commitHash} = ctx.request.body;
        if (repository === undefined || repository === null
            || typeof commitHash !== 'string'
            || typeof filePath !== 'string')
        {
            throw new WrongParameterError();
        }
        const {username, name} = repository;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, isPublic: true, description: ''}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const forkAmount: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {username, name} = ctx.request.body;
        if (Validator.Account.username(username)
            && Validator.Repository.name(name)
            && Repository.validate({username, name, description: '', isPublic: false}))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const forkRepositories: IRouteHandler = forkAmount;
export const forkFrom: IRouteHandler = forkAmount;

export const forkCommitHistory: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {
            sourceRepository, sourceRepositoryBranch,
            targetRepository, targetRepositoryBranch,
            offset, limit,
        } = ctx.request.body;
        if (sourceRepository === undefined
            || sourceRepository === null
            || typeof sourceRepositoryBranch !== 'string'
            || targetRepository === undefined
            || targetRepository === null
            || typeof targetRepositoryBranch !== 'string')
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.COMMIT)
        {
            throw new WrongParameterError();
        }
        const {
            username: sourceRepositoryUsername,
            name: sourceRepositoryName,
        } = sourceRepository;
        const {
            username: targetRepositoryUsername,
            name: targetRepositoryName,
        } = targetRepository;
        if (Validator.Account.username(sourceRepositoryUsername)
            && Validator.Repository.name(sourceRepositoryName)
            && Validator.Account.username(targetRepositoryUsername)
            && Validator.Repository.name(targetRepositoryName)
            && Repository.validate(new Repository(
                sourceRepositoryUsername,
                sourceRepositoryName, '', false))
            && Repository.validate(new Repository(
                targetRepositoryUsername,
                targetRepositoryName, '', false)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const forkCommitAmount: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {
            sourceRepository, sourceRepositoryBranch,
            targetRepository, targetRepositoryBranch,
        } = ctx.request.body;
        if (sourceRepository === undefined
            || sourceRepository === null
            || typeof sourceRepositoryBranch !== 'string'
            || targetRepository === undefined
            || targetRepository === null
            || typeof targetRepositoryBranch !== 'string')
        {
            throw new WrongParameterError();
        }
        const {
            username: sourceRepositoryUsername,
            name: sourceRepositoryName,
        } = sourceRepository;
        const {
            username: targetRepositoryUsername,
            name: targetRepositoryName,
        } = targetRepository;
        if (Validator.Account.username(sourceRepositoryUsername)
            && Validator.Repository.name(sourceRepositoryName)
            && Validator.Account.username(targetRepositoryUsername)
            && Validator.Repository.name(targetRepositoryName)
            && Repository.validate(new Repository(
                sourceRepositoryUsername,
                sourceRepositoryName, '', false))
            && Repository.validate(new Repository(
                targetRepositoryUsername,
                targetRepositoryName, '', false)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const forkFileDiff: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {
            sourceRepository, sourceRepositoryBranch,
            targetRepository, targetRepositoryBranch,
            offset, limit,
        } = ctx.request.body;
        if (sourceRepository === undefined
            || sourceRepository === null
            || typeof sourceRepositoryBranch !== 'string'
            || targetRepository === undefined
            || targetRepository === null
            || typeof targetRepositoryBranch !== 'string')
        {
            throw new WrongParameterError();
        }
        if (!Number.isInteger(offset) || !Number.isInteger(limit)
            || offset < 0 || limit < 0 || limit > LIMITS.DIFF)
        {
            throw new WrongParameterError();
        }
        const {
            username: sourceRepositoryUsername,
            name: sourceRepositoryName,
        } = sourceRepository;
        const {
            username: targetRepositoryUsername,
            name: targetRepositoryName,
        } = targetRepository;
        if (Validator.Account.username(sourceRepositoryUsername)
            && Validator.Repository.name(sourceRepositoryName)
            && Validator.Account.username(targetRepositoryUsername)
            && Validator.Repository.name(targetRepositoryName)
            && Repository.validate(new Repository(
                sourceRepositoryUsername,
                sourceRepositoryName, '', false))
            && Repository.validate(new Repository(
                targetRepositoryUsername,
                targetRepositoryName, '', false)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const forkFileDiffAmount: IRouteHandler = forkCommitAmount;

export const hasCommonAncestor: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {
            sourceRepository, sourceRepositoryBranchName,
            targetRepository, targetRepositoryBranchName,
        } = ctx.request.body;
        if (sourceRepository === undefined
            || sourceRepository === null
            || typeof sourceRepositoryBranchName !== 'string'
            || targetRepository === undefined
            || targetRepository === null
            || typeof targetRepositoryBranchName !== 'string')
        {
            throw new WrongParameterError();
        }
        const {
            username: sourceRepositoryUsername,
            name: sourceRepositoryName,
        } = sourceRepository;
        const {
            username: targetRepositoryUsername,
            name: targetRepositoryName,
        } = targetRepository;
        if (Validator.Account.username(sourceRepositoryUsername)
            && Validator.Repository.name(sourceRepositoryName)
            && Validator.Account.username(targetRepositoryUsername)
            && Validator.Repository.name(targetRepositoryName)
            && Repository.validate(new Repository(
                sourceRepositoryUsername,
                sourceRepositoryName, '', false))
            && Repository.validate(new Repository(
                targetRepositoryUsername,
                targetRepositoryName, '', false)))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};