import {Account, Profile} from '../../../Class';
import {ParameterValidator} from '../../Interface';

export const login: ParameterValidator = (body: any) =>
{
    return Account.validate(body);
};

export const register: ParameterValidator = (body: any) =>
{
    const {account, profile} = body;
    return Account.validate(account) && Profile.validate({username: '', ...profile});
};