import {IParameterValidator} from '../../Interface';

export const get: IParameterValidator = body =>
{
    const {username} = body;
    return typeof username === 'undefined' || typeof username === 'string';
};