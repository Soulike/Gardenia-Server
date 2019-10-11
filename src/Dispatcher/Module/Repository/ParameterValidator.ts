import {ParameterValidator} from '../../Interface';
import {Repository} from '../../../Class';

export const create: ParameterValidator = body =>
{
    return Repository.validate(body);
};

export const del: ParameterValidator = body =>
{
    const {repositoryName} = body;
    return typeof repositoryName === 'string';
};

export const getList: ParameterValidator = body =>
{
    const {start, end, username} = body;
    return typeof start === 'number'
        && typeof end === 'number'
        && (typeof username === 'undefined' || typeof username === 'string');
};