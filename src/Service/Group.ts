import {Account, Group, ResponseBody, ServiceResponse} from '../Class';
import {Group as GroupTable} from '../Database';

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
    const groupInDatabase = await GroupTable.selectById(groupId);
    if (groupInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    const accounts = await GroupTable.getAccountsById(groupId);
    return new ServiceResponse<Account[]>(200, {},
        new ResponseBody<Account[]>(true, '', accounts));
}

export async function addAccounts(group: Pick<Group, 'id'>, usernames: string[]): Promise<ServiceResponse<void>>
{
    const {id: groupId} = group;
    const groupInDatabase = await GroupTable.selectById(groupId);
    if (groupInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    await GroupTable.addAccounts(groupId, usernames);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}