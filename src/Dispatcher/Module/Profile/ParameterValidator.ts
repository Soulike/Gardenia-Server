import {IParameterValidator} from '../../Interface';

export const get: IParameterValidator = body =>
{
    const {account} = body;
    if (typeof account === 'undefined')
    {
        return true;
    }
    const {username} = account;
    return typeof username === 'string';
};