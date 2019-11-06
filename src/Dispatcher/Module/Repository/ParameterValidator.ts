import {IParameterValidator} from '../../Interface';

export const create: IParameterValidator = body =>
{
    const {name, description, isPublic} = body;
    return typeof name === 'string'
        && typeof description === 'string'
        && typeof isPublic === 'boolean';
};

export const del: IParameterValidator = body =>
{
    const {name} = body;
    return typeof name === 'string';
};

export const getRepositories: IParameterValidator = body =>
{
    const {start, end, username} = body;
    return typeof start === 'number'
        && typeof end === 'number'
        && (typeof username === 'undefined' || typeof username === 'string');
};