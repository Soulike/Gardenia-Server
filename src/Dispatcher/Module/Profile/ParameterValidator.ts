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

export const set: IParameterValidator = body =>
{
    const {email, nickname} = body;
    return typeof email === 'string' && validator.isEmail(email) && typeof nickname === 'string';
};

export const uploadAvatar: IParameterValidator = body =>
{
    const {avatar} = body;
    return typeof avatar !== 'undefined';
};