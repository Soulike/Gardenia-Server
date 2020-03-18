import {Account, Group} from '../Class';
import {AccountGroup as AccountGroupTable, Group as GroupTable} from '../Database';

export async function isGroupAdmin(group: Readonly<Pick<Group, 'id'>>, username: string): Promise<boolean>
{
    const {id: groupId} = group;
    return await AccountGroupTable.count({username, groupId, isAdmin: true}) === 1;
}

export async function isGroupMember(group: Readonly<Pick<Group, 'id'>>, username: string): Promise<boolean>
{
    const {id: groupId} = group;
    return await AccountGroupTable.count({username, groupId}) === 1;
}

export async function groupExists(group: Readonly<Pick<Group, 'id'>>): Promise<boolean>
{
    const {id} = group;
    return await GroupTable.count({id}) !== 0;
}

export async function groupNameExists(account: Pick<Account, 'username'>, group: Pick<Group, 'name'>): Promise<boolean>
{
    const {username} = account;
    const {name: groupName} = group;
    const accountGroups = await AccountGroupTable.select({username});
    const groupIds = accountGroups.map(({groupId}) => groupId);
    const queries: Promise<string>[] = [];
    for (const groupId of groupIds)
    {
        queries.push((async () =>
        {
            const {name} = (await GroupTable.selectById(groupId))!; // 对应的 group 一定存在
            return name;
        })());
    }
    const groupNames = await Promise.all(queries);
    return groupNames.includes(groupName);
}