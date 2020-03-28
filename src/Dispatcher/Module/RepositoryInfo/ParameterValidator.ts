import {IParameterValidator} from '../../Interface';
import {Account, Repository} from '../../../Class';

export const repository: IParameterValidator = body =>
{
    const {account, repository} = body;
    if (typeof account === 'undefined' || account === null
        || typeof repository === 'undefined' || repository === null)
    {
        return false;
    }
    else
    {
        const {username} = account;
        const {name} = repository;
        return Account.validate({username, hash: 'a'.repeat(64)})
            && Repository.validate({name, isPublic: true, description: '', username: ''});
    }
};

export const branches: IParameterValidator = body =>
{
    const {repository} = body;
    if (repository === undefined || repository === null)
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, isPublic: true, description: ''});
};

export const branchNames: IParameterValidator = branches;

export const lastBranchCommit: IParameterValidator = body =>
{
    const {account, repository, branch, filePath} = body;
    if (typeof account === 'undefined' || account === null
        || typeof repository === 'undefined' || repository === null)
    {
        return false;
    }
    const {username} = account;
    const {name} = repository;
    return Account.validate({username, hash: 'a'.repeat(64)})
        && Repository.validate({name, isPublic: true, description: '', username: ''})
        && typeof branch === 'string'
        && (typeof filePath === 'undefined' || typeof filePath === 'string');
};

export const lastCommit: IParameterValidator = body =>
{
    const {repository} = body;
    if (repository === undefined || repository === null)
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate(new Repository(username, name, '', false));
};

export const directory: IParameterValidator = body =>
{
    const {account, repository, commitHash, directoryPath} = body;
    if (typeof account === 'undefined' || account === null
        || typeof repository === 'undefined' || repository === null)
    {
        return false;
    }
    const {username} = account;
    const {name} = repository;
    return Account.validate({username, hash: 'a'.repeat(64)})
        && Repository.validate({name, isPublic: true, description: '', username: ''})
        && typeof commitHash === 'string'
        && typeof directoryPath === 'string';
};

export const commitCount: IParameterValidator = body =>
{
    const {account, repository, commitHash} = body;
    if (typeof account === 'undefined' || account === null
        || typeof repository === 'undefined' || repository === null)
    {
        return false;
    }
    const {username} = account;
    const {name} = repository;
    return Account.validate({username, hash: 'a'.repeat(64)})
        && Repository.validate({name, isPublic: true, description: '', username: ''})
        && typeof commitHash === 'string';
};

export const commitCountBetweenCommits: IParameterValidator = body =>
{
    const {repository, baseCommitHash, targetCommitHash} = body;
    if (typeof repository === 'undefined' || repository === null
        || typeof baseCommitHash !== 'string' || typeof targetCommitHash !== 'string')
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({name, isPublic: true, description: '', username});
};

export const fileInfo: IParameterValidator = body =>
{
    const {account, repository, filePath, commitHash} = body;
    if (typeof account === 'undefined' || account === null
        || typeof repository === 'undefined' || repository === null)
    {
        return false;
    }
    const {username} = account;
    const {name} = repository;
    return Account.validate({username, hash: 'a'.repeat(64)})
        && Repository.validate({name, isPublic: true, description: '', username: ''})
        && typeof filePath === 'string'
        && typeof commitHash === 'string';
};

export const rawFile = fileInfo;

export const setName: IParameterValidator = body =>
{
    const {repository, newRepository} = body;
    if (typeof newRepository === 'undefined' || newRepository === null
        || typeof repository === 'undefined' || repository === null)
    {
        return false;
    }
    const {name} = repository;
    const {name: newName} = newRepository;
    return Repository.validate({name, isPublic: true, description: '', username: ''})
        && Repository.validate({name: newName, isPublic: true, description: '', username: ''});
};

export const setDescription: IParameterValidator = body =>
{
    const {repository} = body;
    if (typeof repository === 'undefined' || repository === null)
    {
        return false;
    }
    const {name, description} = repository;
    return Repository.validate({name, description, username: '', isPublic: true});
};

export const setIsPublic: IParameterValidator = body =>
{
    const {repository} = body;
    if (typeof repository === 'undefined' || repository === null)
    {
        return false;
    }
    const {name, isPublic} = repository;
    return Repository.validate({name, isPublic, username: '', description: ''});
};

export const commitHistoryBetweenCommits: IParameterValidator = body =>
{
    const {repository, baseCommitHash, targetCommitHash, offset, limit} = body;
    if (repository === undefined || repository === null
        || typeof baseCommitHash !== 'string'
        || typeof targetCommitHash !== 'string'
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const commitHistory: IParameterValidator = body =>
{
    const {repository, targetCommitHash, offset, limit} = body;
    if (repository === undefined || repository === null
        || typeof targetCommitHash !== 'string'
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const fileCommitHistoryBetweenCommits: IParameterValidator = body =>
{
    const {repository, filePath, baseCommitHash, targetCommitHash, offset, limit} = body;
    if (repository === undefined || repository === null
        || typeof filePath !== 'string'
        || typeof baseCommitHash !== 'string'
        || typeof targetCommitHash !== 'string'
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const fileCommitHistory: IParameterValidator = body =>
{
    const {repository, filePath, targetCommitHash, offset, limit} = body;
    if (repository === undefined || repository === null
        || typeof filePath !== 'string'
        || typeof targetCommitHash !== 'string'
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const diffBetweenCommits: IParameterValidator = body =>
{
    const {repository, baseCommitHash, targetCommitHash, offset, limit} = body;
    if (repository === undefined || repository === null
        || typeof baseCommitHash !== 'string'
        || typeof targetCommitHash !== 'string'
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const diffAmountBetweenCommits: IParameterValidator = diffBetweenCommits;

export const fileDiffBetweenCommits: IParameterValidator = body =>
{
    const {repository, filePath, baseCommitHash, targetCommitHash} = body;
    if (repository === undefined || repository === null
        || typeof filePath !== 'string'
        || typeof baseCommitHash !== 'string'
        || typeof targetCommitHash !== 'string')
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const commit: IParameterValidator = body =>
{
    const {repository, commitHash} = body;
    if (repository === undefined || repository === null || typeof commitHash !== 'string')
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, isPublic: true, description: ''});
};

export const commitDiff: IParameterValidator = body =>
{
    const {repository, commitHash, offset, limit} = body;
    if (repository === undefined || repository === null
        || typeof commitHash !== 'string'
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, isPublic: true, description: ''});
};

export const commitDiffAmount: IParameterValidator = commit;

export const fileCommit: IParameterValidator = body =>
{
    const {repository, filePath, commitHash} = body;
    if (repository === undefined || repository === null
        || typeof commitHash !== 'string'
        || typeof filePath !== 'string')
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, isPublic: true, description: ''});
};

export const forkAmount: IParameterValidator = body =>
{
    const {username, name} = body;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const forkRepositories: IParameterValidator = forkAmount;
export const forkFrom: IParameterValidator = forkAmount;

export const forkCommitHistory: IParameterValidator = body =>
{
    const {
        sourceRepository, sourceRepositoryBranch,
        targetRepository, targetRepositoryBranch,
        offset, limit,
    } = body;
    if (sourceRepository === undefined
        || sourceRepository === null
        || typeof sourceRepositoryBranch !== 'string'
        || targetRepository === undefined
        || targetRepository === null
        || typeof targetRepositoryBranch !== 'string'
        || ((typeof offset !== 'number' || offset < 0) && offset !== undefined)
        || ((typeof limit !== 'number' || limit < 0) && limit !== undefined))
    {
        return false;
    }
    const {
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    } = sourceRepository;
    const {
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    } = targetRepository;
    return Repository.validate(new Repository(
        sourceRepositoryUsername,
        sourceRepositoryName, '', false))
        && Repository.validate(new Repository(
            targetRepositoryUsername,
            targetRepositoryName, '', false));
};

export const forkCommitAmount: IParameterValidator = body =>
{
    const {
        sourceRepository, sourceRepositoryBranch,
        targetRepository, targetRepositoryBranch,
    } = body;
    if (sourceRepository === undefined
        || sourceRepository === null
        || typeof sourceRepositoryBranch !== 'string'
        || targetRepository === undefined
        || targetRepository === null
        || typeof targetRepositoryBranch !== 'string')
    {
        return false;
    }
    const {
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    } = sourceRepository;
    const {
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    } = targetRepository;
    return Repository.validate(new Repository(
        sourceRepositoryUsername,
        sourceRepositoryName, '', false))
        && Repository.validate(new Repository(
            targetRepositoryUsername,
            targetRepositoryName, '', false));
};
export const forkFileDiff: IParameterValidator = forkCommitHistory;
export const forkFileDiffAmount: IParameterValidator = forkCommitAmount;

export const hasCommonAncestor: IParameterValidator = body =>
{
    const {
        sourceRepository, sourceRepositoryBranchName,
        targetRepository, targetRepositoryBranchName,
    } = body;
    if (sourceRepository === undefined
        || sourceRepository === null
        || typeof sourceRepositoryBranchName !== 'string'
        || targetRepository === undefined
        || targetRepository === null
        || typeof targetRepositoryBranchName !== 'string')
    {
        return false;
    }
    const {
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    } = sourceRepository;
    const {
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    } = targetRepository;
    return Repository.validate(new Repository(
        sourceRepositoryUsername,
        sourceRepositoryName, '', false))
        && Repository.validate(new Repository(
            targetRepositoryUsername,
            targetRepositoryName, '', false));
};