import {IParameterValidator} from '../../Interface';

export const add: IParameterValidator = body =>
{
    const {group} = body;
    if (group === undefined || group === null)
    {
        return false;
    }
    const {name} = group;
    return typeof name === 'string';
};

export const dismiss: IParameterValidator = body =>
{
    const {group} = body;
    if (group === undefined || group === null)
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
    if (typeof group === 'undefined' || group === null)
    {
        return false;
    }
    const {id} = group;
    if (typeof id !== 'number' || !Array.isArray(usernames))
    {
        return false;
    }
    else    // typeof id === 'number' && Array.isArray(usernames)
    {
        for (const username of usernames)
        {
            if (typeof username !== 'string')
            {
                return false;
            }
        }
        return true;
    }
};

export const removeAccounts = addAccounts;

export const admins = accounts;

export const addAdmins = addAccounts;

export const removeAdmins = removeAccounts;

export const repositories = dismiss;

export const removeRepositories: IParameterValidator = body =>
{
    const {group, repositories} = body;
    if (group === undefined || group === null)
    {
        return false;
    }
    const {id} = group;
    if (typeof id !== 'number' || !Array.isArray(repositories))
    {
        return false;
    }
    else    // typeof id === 'number' && Array.isArray(repositories)
    {
        for (const repository of repositories)
        {
            const {username, name} = repository;
            if (typeof username !== 'string' || typeof name !== 'string')
            {
                return false;
            }
        }
        return true;
    }
};

export const isAdmin = dismiss;