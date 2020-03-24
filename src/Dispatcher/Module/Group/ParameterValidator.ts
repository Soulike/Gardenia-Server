import {IParameterValidator} from '../../Interface';
import {Account, Group, Repository} from '../../../Class';

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

export const changeName: IParameterValidator = body =>
{
    const {id, name} = body;
    return Group.validate(new Group(id, name));
};

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

export const getByAccount: IParameterValidator = body =>
{
    const {username} = body;
    return Account.validate({username, hash: ''});
};

export const getAdministratingByAccount = getByAccount;

export const admins = accounts;

export const addAdmins = addAccounts;

export const removeAdmins = removeAccounts;

export const getByRepository: IParameterValidator = body =>
{
    const {repository} = body;
    if (repository === undefined || repository === null)
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: true});
};

export const repositories = dismiss;

export const addRepository: IParameterValidator = body =>
{
    const {group, repository} = body;
    if (group === undefined || group === null
        || repository === undefined || repository === null)
    {
        return false;
    }
    const {id} = group;
    const {username, name} = repository;
    return Group.validate(new Group(id, ''))
        && Repository.validate(new Repository(username, name, '', false));
};

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