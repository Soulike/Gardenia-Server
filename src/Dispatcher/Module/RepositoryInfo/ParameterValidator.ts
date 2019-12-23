import {IParameterValidator} from '../../Interface';

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
        return typeof username === 'string'
            || typeof name === 'string';
    }
};

export const branch = repository;

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
    return typeof username === 'string'
        && typeof name === 'string'
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
    return typeof username === 'string'
        && typeof name === 'string'
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
    return typeof username === 'string'
        && typeof name === 'string'
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
    return typeof username === 'string'
        && typeof name === 'string'
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
    return typeof name === 'string'
        && typeof newName === 'string';
};

export const setDescription: IParameterValidator = body =>
{
    const {repository} = body;
    if (typeof repository === 'undefined' || repository === null)
    {
        return false;
    }
    const {name, description} = repository;
    return typeof name === 'string'
        && typeof description === 'string';
};

export const setIsPublic: IParameterValidator = body =>
{
    const {repository} = body;
    if (typeof repository === 'undefined' || repository === null)
    {
        return false;
    }
    const {name, isPublic} = repository;
    return typeof name === 'string'
        && typeof isPublic === 'boolean';
};

export const groups: IParameterValidator = body =>
{
    const {repository} = body;
    if (repository === undefined || repository === null)
    {
        return false;
    }
    const {username, name} = repository;
    return typeof username === 'string' && typeof name === 'string';
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
    return typeof username === 'string'
        && typeof name === 'string'
        && typeof id === 'number';
};