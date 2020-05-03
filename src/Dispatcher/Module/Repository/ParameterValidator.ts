import {IParameterValidator} from '../../Interface';
import {Repository} from '../../../Class';
import Validator from '../../Validator';

export const create: IParameterValidator = body =>
{
    const {name, description, isPublic} = body;
    return Validator.Repository.name(name)
        && Repository.validate({username: '', name, description, isPublic});
};

export const del: IParameterValidator = body =>
{
    const {name} = body;
    return Validator.Repository.name(name)
        && Repository.validate({username: '', name, description: '', isPublic: true});
};

export const getRepositories: IParameterValidator = body =>
{
    const {start, end, username} = body;
    return typeof start === 'number'
        && typeof end === 'number'
        && (typeof username === 'undefined'
            || (Validator.Account.username(username)
                && Repository.validate({username, name: '', description: '', isPublic: true})));
};

export const fork: IParameterValidator = body =>
{
    const {username, name} = body;
    return Validator.Account.username(username)
        && Validator.Repository.name(name)
        && Repository.validate({username, name, isPublic: false, description: ''});
};

export const isMergeable: IParameterValidator = body =>
{
    const {
        sourceRepository,
        sourceRepositoryBranch,
        targetRepository,
        targetRepositoryBranch,
    } = body;
    if (sourceRepository === undefined || sourceRepository === null
        || typeof sourceRepositoryBranch !== 'string'
        || targetRepository === undefined || targetRepository === null
        || typeof targetRepositoryBranch !== 'string')
    {
        return false;
    }
    const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
    const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
    return Validator.Account.username(sourceRepositoryUsername)
        && Validator.Repository.name(sourceRepositoryName)
        && Validator.Account.username(targetRepositoryUsername)
        && Validator.Repository.name(targetRepositoryName)
        && Repository.validate(new Repository(sourceRepositoryUsername, sourceRepositoryName, '', true))
        && Repository.validate(new Repository(targetRepositoryUsername, targetRepositoryName, '', true));
};