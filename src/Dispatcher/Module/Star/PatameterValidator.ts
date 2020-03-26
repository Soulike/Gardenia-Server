import {IParameterValidator} from '../../Interface';
import {Account, Repository} from '../../../Class';

export const add: IParameterValidator = body =>
{
    const {repository} = body;
    if (repository === undefined || repository === null)
    {
        return false;
    }
    const {username, name} = repository;
    return Repository.validate(
        new Repository(username, name, '', false));
};

export const remove: IParameterValidator = add;

export const getStaredRepositories: IParameterValidator = body =>
{
    const {account, offset, limit} = body;
    if (typeof offset !== 'number' || typeof limit !== 'number')
    {
        return false;
    }
    if (account === undefined)
    {
        return true;
    }
    if (account === null)
    {
        return false;
    }
    const {username} = account;
    return Account.validate(new Account(username, ''));
};

export const getStaredRepositoriesAmount: IParameterValidator = body =>
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
    return Account.validate(new Account(username, ''));
};

export const isStaredRepository: IParameterValidator = add;
export const getRepositoryStarAmount: IParameterValidator = add;
export const getRepositoryStarUsers: IParameterValidator = add;