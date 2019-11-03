import {Account, Profile} from '../../../Class';
import {IParameterValidator} from '../../Interface';

export const login: IParameterValidator = body =>
{
    return Account.validate(body);
};

export const register: IParameterValidator = body =>
{
    const {account, profile} = body;
    return Account.validate(account) && Profile.validate({username: '', ...profile});
};

export const getGroups: IParameterValidator = body =>
{
    const {username} = body;
    return typeof username === 'string';
};

export const getAdministratingGroups = getGroups;

export const checkPassword: IParameterValidator = body =>
{
    const {hash} = body;
    return typeof hash === 'string';
};