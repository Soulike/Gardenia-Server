import {IParameterValidator} from '../../Interface';
import {Account, Profile} from '../../../Class';

export const get: IParameterValidator = body =>
{
    const {account} = body;
    if (typeof account === 'undefined' || account === null)
    {
        return true;
    }
    const {username} = account;
    return Account.validate({username, hash: 'a'.repeat(64)});
};

export const set: IParameterValidator = body =>
{
    const {email, nickname} = body;
    if (email !== undefined
        && !Profile.validate({email, nickname: '', username: '', avatar: ''}))
    {
        return false;
    }
    else if (nickname !== undefined
        && !Profile.validate({nickname, email: 'a@b.com', username: '', avatar: ''}))
    {
        return false;
    }
    return true;
};

export const uploadAvatar: IParameterValidator = body =>
{
    const {avatar} = body;
    return typeof avatar !== 'undefined' && avatar !== null;    // 这里的 avatar 是二进制文件
};