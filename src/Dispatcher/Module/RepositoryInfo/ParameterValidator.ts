import {ParameterValidator} from '../../Interface';

export const repository: ParameterValidator = body =>
{
    const {username, repositoryName} = body;
    return typeof username === 'string' || typeof repositoryName === 'string';
};

export const branch = repository;

export const lastCommit: ParameterValidator = body =>
{
    const {username, repositoryName, branch, filePath} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof branch === 'string'
        && (typeof filePath === 'undefined' || typeof filePath === 'string');
};

export const directory: ParameterValidator = body =>
{
    const {username, repositoryName, branch, directoryPath} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof branch === 'string'
        && typeof directoryPath === 'string';
};

export const commitCount: ParameterValidator = body =>
{
    const {username, repositoryName, branch} = body;
    return typeof username === 'string'
        && typeof repositoryName === 'string'
        && typeof branch === 'string';
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