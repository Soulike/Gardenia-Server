import {Account as AccountClass, Group, Profile as ProfileClass, ResponseBody, ServiceResponse} from '../Class';
import {Account as AccountTable} from '../Database';
import {Session} from 'koa-session';
import {Session as SessionFunction} from '../Function';
import {InvalidSessionError} from '../Dispatcher/Class';

export async function login(account: Readonly<AccountClass>): Promise<ServiceResponse<void>>
{
    const {username, hash} = account;
    const accountInDatabase = await AccountTable.selectByUsername(username);
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

export async function register(account: Readonly<AccountClass>, profile: Readonly<Omit<ProfileClass, 'username'>>): Promise<ServiceResponse<void>>
{
    const {username} = account;
    if ((await AccountTable.selectByUsername(username)) !== null) // 检查用户名是不是已经存在了
    {
        return new ServiceResponse<void>(200, {}, new ResponseBody<void>(false, '用户名已存在'));
    }
    await AccountTable.create(account, {username: account.username, ...profile});
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function checkSession(session: Readonly<Session>): Promise<ServiceResponse<{ isValid: boolean }>>
{
    return new ServiceResponse<{ isValid: boolean }>(200, {},
        new ResponseBody(true, '', {isValid: SessionFunction.isValid(session)}));
}

export async function logout(): Promise<ServiceResponse<void>>
{
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true), {username: undefined});
}

export async function getGroups(account: Readonly<Pick<AccountClass, 'username'>>): Promise<ServiceResponse<Group[]>>
{
    const {username} = account;
    const accountInDatabase = await AccountTable.selectByUsername(username);
    if (accountInDatabase === null)
    {
        return new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, '用户不存在'));
    }
    const groups = await AccountTable.getGroupsByUsername(username);
    return new ServiceResponse<Group[]>(200, {},
        new ResponseBody<Group[]>(true, '', groups));
}

export async function getAdministratingGroups(account: Readonly<Pick<AccountClass, 'username'>>): Promise<ServiceResponse<Group[]>>
{
    const {username} = account;
    const accountInDatabase = await AccountTable.selectByUsername(username);
    if (accountInDatabase === null)
    {
        return new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, '用户不存在'));
    }
    const groups = await AccountTable.getAdministratingGroupsByUsername(username);
    return new ServiceResponse<Group[]>(200, {},
        new ResponseBody<Group[]>(true, '', groups));
}

export async function checkPassword(account: Readonly<Pick<AccountClass, 'hash'>>, session: Readonly<Session>): Promise<ServiceResponse<{ isCorrect: boolean }>>
{
    const {username} = session;
    if (typeof username !== 'string')
    {
        throw new InvalidSessionError();
    }
    const {hash} = account;
    const accountInDatabase = await AccountTable.selectByUsername(username);
    if (accountInDatabase === null)
    {
        return new ServiceResponse<{ isCorrect: boolean }>(200, {},
            new ResponseBody<{ isCorrect: boolean }>(true, '', {isCorrect: false}));
    }
    const {hash: expectedHash} = accountInDatabase;
    return new ServiceResponse<{ isCorrect: boolean }>(200, {},
        new ResponseBody<{ isCorrect: boolean }>(true, '', {isCorrect: hash === expectedHash}));
}