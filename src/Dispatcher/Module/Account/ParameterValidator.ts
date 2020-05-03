import {Account, Profile} from '../../../Class';
import {IParameterValidator} from '../../Interface';
import Validator from '../../Validator';

export const login: IParameterValidator = body =>
{
    const {username, hash} = body;
    return Validator.Account.username(username)
        && Validator.Account.hash(hash)
        && Account.validate(body);
};

export const register: IParameterValidator = body =>
{
    const {account, profile, verificationCode} = body;
    const {username, hash} = account;
    const {nickname, email} = profile;
    return Validator.Account.username(username)
        && Validator.Account.hash(hash)
        && Validator.Profile.nickname(nickname)
        && Validator.Profile.email(email)
        && Account.validate(account)
        && Profile.validate({username: '', ...profile})
        && Validator.Account.verificationCode(verificationCode);
};

export const sendVerificationCodeByUsername: IParameterValidator = body =>
{
    const {username} = body;
    return Validator.Account.username(username)
        && Profile.validate(new Profile(username, '', 'a@b.com', ''));
};

export const sendVerificationCodeToEmail: IParameterValidator = body =>
{
    const {email} = body;
    return Validator.Profile.email(email)
        && Profile.validate(new Profile('', '', email, ''));
};

export const changePassword: IParameterValidator = body =>
{
    const {account, verificationCode} = body;
    if (account === undefined || account === null)
    {
        return false;
    }
    const {username, hash} = account;
    return Validator.Account.username(username)
        && Validator.Account.hash(hash)
        && Validator.Account.verificationCode(verificationCode)
        && Account.validate(new Account(username, hash));
};

export const checkPassword: IParameterValidator = body =>
{
    const {hash} = body;
    return Validator.Account.hash(hash)
        && Account.validate({username: '', hash});
};