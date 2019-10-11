import {ParameterValidator} from '../../Interface';

export const repository: ParameterValidator = body =>
{
    const {username, name} = body;
    return typeof username === 'string' || typeof name === 'string';
};

export const branch = repository;

export const lastCommit: ParameterValidator = body =>
{
    const {username, name, branch, file} = body;
    return typeof username === 'string'
        && typeof name === 'string'
        && typeof branch === 'string'
        && (typeof file === 'undefined' || typeof file === 'string');
};

export const directory: ParameterValidator = body =>
{
    const {username, name, branch, path} = body;
    return typeof username === 'string'
        && typeof name === 'string'
        && typeof branch === 'string'
        && typeof path === 'string';
};

export const commitCount: ParameterValidator = body =>
{
    const {username, name, branch} = body;
    return typeof username === 'string'
        && typeof name === 'string'
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