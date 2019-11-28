import {Account, Group} from '../Class';
import {Session} from 'koa-session';
import {Account as AccountTable, Group as GroupTable} from '../Database';

export async function isGroupAdmin(group: Readonly<Pick<Group, 'id'>>, session: Readonly<Session>): Promise<boolean>
{
    const {username} = session;
    const {id: groupId} = group;
    const adminsInGroup = await GroupTable.getAdminsById(groupId);
    return adminsInGroup.map(({username}) => username).includes(username);
}

export async function isGroupMember(group: Readonly<Pick<Group, 'id'>>, username: string): Promise<boolean>
{
    const accountsInGroup = await GroupTable.getAccountsById(group.id);
    return accountsInGroup.map(({username}) => username).includes(username);
}

export async function groupExists(group: Readonly<Pick<Group, 'id'>>): Promise<boolean>
{
    const {id} = group;
    const groupInDatabase = await GroupTable.selectById(id);
    return groupInDatabase !== null;
}

export async function groupNameExists(account: Pick<Account, 'username'>, group: Pick<Group, 'name'>): Promise<boolean>
{
    const {username} = account;
    const {name: groupName} = group;
    const groupInDatabase = await AccountTable.getGroupByUsernameAndGroupName(username, groupName);
    return groupInDatabase !== null;
}