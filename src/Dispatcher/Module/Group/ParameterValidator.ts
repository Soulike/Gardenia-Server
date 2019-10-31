import {IParameterValidator} from '../../Interface';

export const add: IParameterValidator = body =>
{
    const {group} = body;
    if (group === undefined)
    {
        return false;
    }
    const {name} = group;
    return typeof name === 'string';
};

export const dismiss: IParameterValidator = body =>
{
    const {group} = body;
    if (group === undefined)
    {
        return false;
    }
    const {id} = group;
    return typeof id === 'number';
};

export const info = dismiss;

export const accounts = dismiss;

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

export const removeAccounts = addAccounts;

export const admins = accounts;

export const addAdmins = addAccounts;

export const removeAdmins = removeAccounts;

export const repositories = dismiss;

export const removeRepositories: IParameterValidator = body =>
{
    const {group, repositories} = body;
    if (group === undefined)
    {
        return false;
    }
    const {id} = group;
    return typeof id === 'number'
        && Array.isArray(repositories);
};