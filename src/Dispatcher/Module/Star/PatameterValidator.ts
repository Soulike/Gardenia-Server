import {IParameterValidator} from '../../Interface';
import {Account, Repository} from '../../../Class';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';

export const add: IParameterValidator = body =>
{
    const {repository} = body;
    if (repository === undefined || repository === null)
    {
        return false;
    }
    const {username, name} = repository;
    return Validator.Account.username(username)
        && Validator.Repository.name(name)
        && Repository.validate(
            new Repository(username, name, '', false));
};

export const remove: IParameterValidator = add;

export const getStaredRepositories: IParameterValidator = body =>
{
    const {account, offset, limit} = body;
    if (!Number.isInteger(offset) || !Number.isInteger(limit))
    {
        return false;
    }
    if (offset < 0 || limit < 0 || limit > LIMITS.REPOSITORIES)
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
    return Validator.Account.username(username)
        && Account.validate(new Account(username, ''));
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
    return Validator.Account.username(username)
        && Account.validate(new Account(username, ''));
};

export const isStaredRepository: IParameterValidator = add;
export const getRepositoryStarAmount: IParameterValidator = add;
export const getRepositoryStarUsers: IParameterValidator = add;