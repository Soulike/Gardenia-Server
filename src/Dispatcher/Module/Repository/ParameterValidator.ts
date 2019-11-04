import {IParameterValidator} from '../../Interface';
import {Repository} from '../../../Class';

export const create: IParameterValidator = body =>
{
    return Repository.validate(body);
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