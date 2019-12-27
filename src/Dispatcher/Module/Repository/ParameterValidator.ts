import {IParameterValidator} from '../../Interface';
import {Repository} from '../../../Class';

export const create: IParameterValidator = body =>
{
    const {name, description, isPublic} = body;
    return Repository.validate({username: '', name, description, isPublic});
};

export const del: IParameterValidator = body =>
{
    const {name} = body;
    return Repository.validate({username: '', name, description: '', isPublic: true});
};

export const getRepositories: IParameterValidator = body =>
{
    const {start, end, username} = body;
    return typeof start === 'number'
        && typeof end === 'number'
        && (typeof username === 'undefined'
            || Repository.validate({username, name: '', description: '', isPublic: true}));
};