import {ParameterValidator} from '../../Interface';

export const repository: ParameterValidator = body =>
{
    const {username, repositoryName} = body;
    return typeof username === 'string' || typeof repositoryName === 'string';
};

export const branch = repository;

export const lastCommit: ParameterValidator = body =>
{
    const {username, repositoryName, commitHash, filePath} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof commitHash === 'string'
        && (typeof filePath === 'undefined' || typeof filePath === 'string');
};

export const directory: ParameterValidator = body =>
{
    const {username, repositoryName, commitHash, directoryPath} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof commitHash === 'string'
        && typeof directoryPath === 'string';
};

export const commitCount: ParameterValidator = body =>
{
    const {username, repositoryName, commitHash} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof commitHash === 'string';
};

export const fileInfo: ParameterValidator = body =>
{
    const {username, repositoryName, filePath, commitHash} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof filePath === 'string'
        && typeof commitHash === 'string';
};

export const rawFile = fileInfo;

export const setName: ParameterValidator = body =>
{
    const {repositoryName, newRepositoryName} = body;
    return typeof repositoryName === 'string'
        && typeof newRepositoryName === 'string';
};

export const setDescription: ParameterValidator = body =>
{
    const {repositoryName, description} = body;
    return typeof repositoryName === 'string'
        && typeof description === 'string';
};