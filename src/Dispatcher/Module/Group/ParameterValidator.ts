import {IParameterValidator} from '../../Interface';

export const info: IParameterValidator = body =>
{
    const {group} = body;
    if (group === undefined)
    {
        return false;
    }
    const {id} = group;
    return typeof id === 'number';
};

export const accounts = info;

export const addAccounts: IParameterValidator = body =>
{
    const {group, usernames} = body;
    if (typeof group === 'undefined')
    {
        return false;
    }
    const {id} = group;
    return typeof id === 'number' && Array.isArray(usernames);
};