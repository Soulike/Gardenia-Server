import {ParameterValidator} from '../../Interface';

export const get: ParameterValidator = body =>
{
    const {username} = body;
    return typeof username === 'undefined' || typeof username === 'string';
};