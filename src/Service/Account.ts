import {Account as AccountClass, Profile as ProfileClass, ResponseBody, ServiceResponse} from '../Class';
import {Account as AccountTable} from '../Database';
import {Session} from 'koa-session';

export async function login(username: AccountClass['username'], hash: AccountClass['hash'], session: Session): Promise<ServiceResponse<void>>
{
    const account = await AccountTable.select(username);
    if (account === null)   // 检查用户名是否存在
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名或密码错误'));
    }

    if (hash === account.hash)  // 检查密码是否正确
    {
        session.username = username;
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true));
    }
    else
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名或密码错误'));
    }
}

export async function register(username: AccountClass['username'], hash: AccountClass['hash'], email: ProfileClass['email']): Promise<ServiceResponse<void>>
{
    if ((await AccountTable.select(username)) !== null) // 检查用户名是不是已经存在了
    {
        return new ServiceResponse<void>(200, {}, new ResponseBody<void>(false, '用户名已存在'));
    }
    const account = new AccountClass(username, hash);
    const profile = new ProfileClass(username, username, email, '');
    await AccountTable.create(account, profile);
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}