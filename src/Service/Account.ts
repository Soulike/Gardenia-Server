import {Account as AccountClass, Profile as ProfileClass, ResponseBody, ServiceResponse} from '../Class';
import {Account as AccountTable} from '../Database';
import {Session} from 'koa-session';
import {Session as SessionFunction} from '../Function';

export async function login(account: AccountClass): Promise<ServiceResponse<void>>
{
    const {username, hash} = account;
    const accountInDatabase = await AccountTable.select(username);
    if (accountInDatabase === null)   // 检查用户名是否存在
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名或密码错误'));
    }

    if (hash === accountInDatabase.hash)  // 检查密码是否正确
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true), {username: username});
    }
    else
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名或密码错误'));
    }
}

export async function register(account: AccountClass, profile: Omit<ProfileClass, 'username'>): Promise<ServiceResponse<void>>
{
    const {username} = account;
    if ((await AccountTable.select(username)) !== null) // 检查用户名是不是已经存在了
    {
        return new ServiceResponse<void>(200, {}, new ResponseBody<void>(false, '用户名已存在'));
    }
    await AccountTable.create(account, {username: account.username, ...profile});
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function checkSession(session: Session | null): Promise<ServiceResponse<{ isValid: boolean }>>
{
    return new ServiceResponse<{ isValid: boolean }>(200, {},
        new ResponseBody(true, '', {isValid: SessionFunction.isValid(session)}));
}

export async function logout(): Promise<ServiceResponse<void>>
{
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true), {username: undefined});
}