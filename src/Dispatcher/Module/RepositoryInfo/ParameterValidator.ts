import {IParameterValidator} from '../../Interface';
import {Account, Group, Repository} from '../../../Class';

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

export const lastCommit: IParameterValidator = body =>
{
    const {account, repository, commitHash, filePath} = body;
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
        && (typeof filePath === 'undefined' || typeof filePath === 'string');
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

export const groups: IParameterValidator = body =>
{
    const {repository} = body;
    if (repository === undefined || repository === null)
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: true});
};

export const addToGroup: IParameterValidator = body =>
{
    const {repository, group} = body;
    if (repository === undefined || repository === null
        || group === undefined || group === null)
    {
        return false;
    }
    const {username, name} = repository;
    const {id} = group;
    return Repository.validate({username, name, isPublic: true, description: ''})
        && Group.validate({id, name: ''});
};

export const commitHistoryBetweenCommits: IParameterValidator = body =>
{
    const {repository, baseCommitHash, targetCommitHash} = body;
    if (repository === undefined || repository === null
        || typeof baseCommitHash !== 'string'
        || typeof targetCommitHash !== 'string')
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const commitHistory: IParameterValidator = body =>
{
    const {repository, targetCommitHash} = body;
    if (repository === undefined || repository === null
        || typeof targetCommitHash !== 'string')
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const fileCommitHistoryBetweenCommits: IParameterValidator = body =>
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

export const fileCommitHistory: IParameterValidator = body =>
{
    const {repository, filePath, targetCommitHash} = body;
    if (repository === undefined || repository === null
        || typeof filePath !== 'string'
        || typeof targetCommitHash !== 'string')
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const diffBetweenCommits: IParameterValidator = commitHistoryBetweenCommits;
export const fileDiffBetweenCommits: IParameterValidator = fileCommitHistoryBetweenCommits;

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