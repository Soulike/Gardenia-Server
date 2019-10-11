import {ParameterValidator} from '../../Interface';
import {Repository} from '../../../Class';

export const create: ParameterValidator = body =>
{
    return Repository.validate(body);
};

export const del: ParameterValidator = body =>
{
    const {name} = body;
    return typeof name === 'string';
};

export const getList: ParameterValidator = body =>
{
    const {start, end, username} = body;
    return typeof start === 'number'
        && typeof end === 'number'
        && (typeof username === 'undefined' || typeof username === 'string');
};