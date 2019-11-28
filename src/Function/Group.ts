import {Group} from '../Class';
import {Session} from 'koa-session';
import {Group as GroupTable} from '../Database';

export async function isAbleToUpdateGroup(group: Readonly<Pick<Group, 'id'>>, session: Readonly<Session>): Promise<boolean>
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