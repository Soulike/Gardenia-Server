import {Account, Group, ResponseBody, ServiceResponse} from '../Class';
import {Account as AccountTable, Group as GroupTable} from '../Database';
import {Session} from 'koa-session';

export async function info(group: Pick<Group, 'id'>): Promise<ServiceResponse<Group | void>>
{
    const {id: groupId} = group;
    const groupInDatabase = await GroupTable.selectById(groupId);
    if (groupInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    return new ServiceResponse<Group>(200, {},
        new ResponseBody<Group>(true, '', groupInDatabase));
}

export async function accounts(group: Pick<Group, 'id'>): Promise<ServiceResponse<Account[] | void>>
{
    const {id: groupId} = group;
    if (!(await groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    const accounts = await GroupTable.getAccountsById(groupId);
    return new ServiceResponse<Account[]>(200, {},
        new ResponseBody<Account[]>(true, '', accounts));
}

export async function addAccounts(group: Pick<Group, 'id'>, usernames: string[], session: Session | null): Promise<ServiceResponse<void>>
{
    if (!(await isAbleToUpdateGroup(group, session)))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '权限不足'));
    }
    const {id: groupId} = group;
    if (!(await groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    const accountsInDatabase =
        await Promise.all(usernames.map(username => AccountTable.selectByUsername(username)));
    if (accountsInDatabase.includes(null))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '用户不存在'));
    }
    await GroupTable.addAccounts(groupId, usernames);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function removeAccounts(group: Pick<Group, 'id'>, usernames: string[], session: Session | null): Promise<ServiceResponse<void>>
{
    if (!(await isAbleToUpdateGroup(group, session)))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '权限不足'));
    }
    const {id: groupId} = group;
    if (!(await groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    await GroupTable.removeAccounts(groupId, usernames);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

async function isAbleToUpdateGroup(group: Pick<Group, 'id'>, session: Session | null): Promise<boolean>
{
    if (session === null)
    {
        return false;
    }
    const {username} = session;
    const {id: groupId} = group;
    const accountsInGroup = await GroupTable.getAccountsById(groupId);
    return accountsInGroup.map(({username}) => username).includes(username);
}

async function groupExists(group: Pick<Group, 'id'>): Promise<boolean>
{
    const {id} = group;
    const groupInDatabase = await GroupTable.selectById(id);
    return groupInDatabase !== null;
}