import {IParameterValidator} from '../../Interface';
import Validator from '../../Validator';
import {LIMITS} from '../../../CONFIG';

export const get: IParameterValidator = body =>
{
    const {account} = body;
    if (typeof account === 'undefined' || account === null)
    {
        return true;
    }
    const {username} = account;
    return typeof username === 'string';    // 这里不用 validate 方法是因为允许 username 是任何字符串
};

export const getByEmail: IParameterValidator = body =>
{
    const {email} = body;
    return typeof email === 'string'; // 这里不用 validate 方法是因为允许 email 是不是邮箱的字符串
};

export const setNickname: IParameterValidator = body =>
{
    const {nickname} = body;
    return Validator.Profile.nickname(nickname);
};

export const setEmail: IParameterValidator = body =>
{
    const {email, verificationCode} = body;
    return Validator.Profile.email(email) && typeof verificationCode === 'string';
};

export const sendSetEmailVerificationCodeToEmail: IParameterValidator = body =>
{
    const {email} = body;
    return Validator.Profile.email(email);
};

export const uploadAvatar: IParameterValidator = body =>
{
    const {avatar} = body; // 这里的 avatar 是 File 类型
    if (typeof avatar === 'undefined' || avatar === null)
    {
        return false;
    }
    // 限制文件的类型和尺寸
    const {size, type} = avatar;
    return typeof type === 'string'
        && LIMITS.AVATAR_MIME_TYPES.includes(type)
        && size <= LIMITS.AVATAR_SIZE;
};