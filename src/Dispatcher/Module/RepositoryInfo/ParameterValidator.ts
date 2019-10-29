import {IParameterValidator} from '../../Interface';

export const repository: IParameterValidator = body =>
{
    const {username, repositoryName} = body;
    return typeof username === 'string' || typeof repositoryName === 'string';
};

export const branch = repository;

export const lastCommit: IParameterValidator = body =>
{
    const {username, repositoryName, commitHash, filePath} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof commitHash === 'string'
        && (typeof filePath === 'undefined' || typeof filePath === 'string');
};

export const directory: IParameterValidator = body =>
{
    const {username, repositoryName, commitHash, directoryPath} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof commitHash === 'string'
        && typeof directoryPath === 'string';
};

export const commitCount: IParameterValidator = body =>
{
    const {username, repositoryName, commitHash} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof commitHash === 'string';
};

export const fileInfo: IParameterValidator = body =>
{
    const {username, repositoryName, filePath, commitHash} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof filePath === 'string'
        && typeof commitHash === 'string';
};

export const rawFile = fileInfo;

export const setName: IParameterValidator = body =>
{
    const {repositoryName, newRepositoryName} = body;
    return typeof repositoryName === 'string'
        && typeof newRepositoryName === 'string';
};

export const setDescription: IParameterValidator = body =>
{
    const {repositoryName, description} = body;
    return typeof repositoryName === 'string'
        && typeof description === 'string';
};

export const groups: IParameterValidator = body =>
{
    const {repository} = body;
    if (repository === undefined)
    {
        return false;
    }
    const {username, name} = body;
    return typeof username === 'string' && typeof name === 'string';
};