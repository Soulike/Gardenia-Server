import {IParameterValidator} from '../../Interface';
import {Account, Repository} from '../../../Class';

export const generateCode: IParameterValidator = body =>
{
    const {repository} = body;
    if (repository === undefined || repository === null)
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate({username, name, description: '', isPublic: false});
};

export const add: IParameterValidator = body =>
{
    const {code} = body;
    return typeof code === 'string';
};

export const remove: IParameterValidator = body =>
{
    const {repository, account} = body;
    if (repository === undefined || repository === null
        || account === undefined || account === null)
    {
        return false;
    }
    const {username: usernameOfRepository, name} = repository;
    const {username} = account;
    return Repository.validate({username: usernameOfRepository, name, isPublic: false, description: ''})
        && Account.validate({username, hash: ''});
};

export const getCollaborators: IParameterValidator = generateCode;
export const getCollaboratorsAmount: IParameterValidator = generateCode;

export const getCollaboratingRepositories: IParameterValidator = body =>
{
    const {account} = body;
    if (account === undefined)
    {
        return true;
    }
    if (account === null)
    {
        return false;
    }
    const {username} = account;
    return Account.validate({username, hash: ''});
};

export const getCollaboratingRepositoriesAmount: IParameterValidator = getCollaboratingRepositories;