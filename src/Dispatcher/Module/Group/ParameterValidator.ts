import {IParameterValidator} from '../../Interface';
import {Account, Group, Repository} from '../../../Class';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';

const {GROUP_ID} = LIMITS;

export const add: IParameterValidator = body =>
{
    const {group} = body;
    if (group === undefined || group === null)
    {
        return false;
    }
    const {name} = group;
    return Validator.Group.name(name);
};

export const dismiss: IParameterValidator = body =>
{
    const {group} = body;
    if (group === undefined || group === null)
    {
        return false;
    }
    const {id} = group;
    return id >= GROUP_ID.MIN
        && id <= GROUP_ID.MAX
        && Group.validate(new Group(id, ''));
};

export const info = dismiss;

export const changeName: IParameterValidator = body =>
{
    const {id, name} = body;
    return id >= GROUP_ID.MIN
        && id <= GROUP_ID.MAX
        && Validator.Group.name(name)
        && Group.validate(new Group(id, name));
};

export const accounts = dismiss;

export const addAccount: IParameterValidator = body =>
{
    const {group, account} = body;
    if (group === undefined || group === null
        || account === undefined || account === null)
    {
        return false;
    }
    const {id} = group;
    const {username} = account;
    return Group.validate({id, name: 'dad'})
        && Validator.Account.username(username);
};

export const addAccounts: IParameterValidator = body =>
{
    const {group, usernames} = body;
    if (group === undefined || group === null)
    {
        return false;
    }
    const {id} = group;
    if (!Group.validate(new Group(id, '')) || !Array.isArray(usernames))
    {
        return false;
    }
    else if (id > GROUP_ID.MAX || id < GROUP_ID.MIN)
    {
        return false;
    }
    else    // Group.validate(new Group(id, '')) && Array.isArray(usernames)
    {
        for (const username of usernames)
        {
            if (!Validator.Account.username(username))
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
    return Validator.Account.username(username)
        && Account.validate({username, hash: ''});
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
    return Validator.Account.username(username)
        && Validator.Repository.name(name)
        && Repository.validate({username, name, description: '', isPublic: true});
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
    return id >= GROUP_ID.MIN
        && id <= GROUP_ID.MAX
        && Validator.Account.username(username)
        && Validator.Repository.name(name)
        && Group.validate(new Group(id, ''))
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
    if (!Group.validate(new Group(id, '')) || !Array.isArray(repositories))
    {
        return false;
    }
    else if (id > GROUP_ID.MAX || id < GROUP_ID.MIN)
    {
        return false;
    }
    else    // Group.validate(new Group(id, '')) && Array.isArray(repositories)
    {
        for (const repository of repositories)
        {
            const {username, name} = repository;
            if (!Validator.Account.username(username) || !Validator.Repository.name(name))
            {
                return false;
            }
        }
        return true;
    }
};

export const isAdmin = dismiss;