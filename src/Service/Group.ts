import {Account, Group, Repository, ResponseBody, ServiceResponse} from '../Class';
import {Account as AccountTable, Group as GroupTable, Repository as RepositoryTable} from '../Database';
import {Session} from 'koa-session';
import {Group as GroupFunction} from '../Function';

export async function add(group: Readonly<Omit<Group, 'id'>>, session: Readonly<Session>): Promise<ServiceResponse<Pick<Group, 'id'> | void>>
{
    const {username} = session;
    if (await GroupFunction.groupNameExists({username}, {name: group.name}))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '小组名已存在'));
    }

    let groupId = 0;
    try
    {
        groupId = await GroupTable.insertAndReturnId(group);
        await GroupTable.addAccounts(groupId, [username]);
        await GroupTable.addAdmins(groupId, [username]);
    }
    catch (e)
    {
        await GroupTable.deleteById(groupId);
        throw e;
    }
    return new ServiceResponse<Pick<Group, 'id'>>(200, {},
        new ResponseBody<Pick<Group, 'id'>>(true, '', {id: groupId}));
}

export async function dismiss(group: Readonly<Pick<Group, 'id'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    if (!(await GroupFunction.isGroupAdmin(group, session)))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '解散失败：您不是小组的管理员'));
    }
    await GroupTable.deleteById(group.id);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function info(group: Readonly<Pick<Group, 'id'>>): Promise<ServiceResponse<Group | void>>
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

export async function accounts(group: Readonly<Pick<Group, 'id'>>): Promise<ServiceResponse<Account[] | void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    const accounts = await GroupTable.getAccountsById(groupId);
    return new ServiceResponse<Account[]>(200, {},
        new ResponseBody<Account[]>(true, '', accounts));
}

export async function addAccounts(group: Readonly<Pick<Group, 'id'>>, usernames: Readonly<string[]>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    if (!(await GroupFunction.isGroupAdmin(group, session)))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '添加失败：您不是小组的管理员'));
    }
    for (const username of usernames)
    {
        if (await AccountTable.selectByUsername(username) === null)
        {
            return new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, `用户${username}不存在`));
        }
    }
    await GroupTable.addAccounts(groupId, usernames);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function removeAccounts(group: Readonly<Pick<Group, 'id'>>, usernames: Readonly<string[]>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    if (!(await GroupFunction.isGroupAdmin(group, session)))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '删除失败：您不是小组的管理员'));
    }
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    const {username: usernameInSession} = session!;
    if (usernames.includes(usernameInSession))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '不允许移除自己'));
    }
    await GroupTable.removeAccounts(groupId, usernames);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function admins(group: Readonly<Pick<Group, 'id'>>): Promise<ServiceResponse<Account[] | void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    const accounts = await GroupTable.getAdminsById(groupId);
    return new ServiceResponse<Account[]>(200, {},
        new ResponseBody<Account[]>(true, '', accounts));
}

export async function addAdmins(group: Readonly<Pick<Group, 'id'>>, usernames: Readonly<string[]>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    if (!(await GroupFunction.isGroupAdmin(group, session)))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '添加失败：您不是小组的管理员'));
    }
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    for (const username of usernames)
    {
        if (await AccountTable.selectByUsername(username) === null)
        {
            return new ServiceResponse<void>(403, {},
                new ResponseBody<void>(false, `用户${username}不存在`));
        }
        if (!(await GroupFunction.isGroupMember(group, username)))
        {
            return new ServiceResponse<void>(403, {},
                new ResponseBody<void>(false, `用户${username}不是小组成员`));
        }
    }
    await GroupTable.addAdmins(groupId, usernames);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function removeAdmins(group: Readonly<Pick<Group, 'id'>>, usernames: Readonly<string[]>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    if (!(await GroupFunction.isGroupAdmin(group, session)))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '删除失败：您不是小组的管理员'));
    }
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    await GroupTable.removeAdmins(groupId, usernames);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function repositories(group: Readonly<Pick<Group, 'id'>>): Promise<ServiceResponse<Repository[] | void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<Repository[]>(404, {},
            new ResponseBody<Repository[]>(false, '小组不存在'));
    }
    const repositories = await GroupTable.getRepositoriesById(groupId);
    return new ServiceResponse<Repository[]>(200, {},
        new ResponseBody<Repository[]>(true, '', repositories));
}

export async function removeRepositories(group: Readonly<Pick<Group, 'id'>>, repositories: Pick<Repository, 'username' | 'name'>[], session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    if (!(await GroupFunction.isGroupAdmin(group, session)))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '删除失败：您不是小组的管理员'));
    }
    for (const {username, name} of repositories)
    {
        if (await RepositoryTable.selectByUsernameAndName({username, name}) === null)
        {
            return new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, `仓库${name}不存在`));
        }
    }
    await GroupTable.removeRepositories(group.id, repositories);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true, ''));
}

export async function isAdmin(group: Readonly<Pick<Group, 'id'>>, session: Readonly<Session>): Promise<ServiceResponse<{ isAdmin: boolean } | void>>
{
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    const {username} = session;
    if (typeof username !== 'string')
    {
        return new ServiceResponse<{ isAdmin: boolean }>(200, {},
            new ResponseBody<{ isAdmin: boolean }>(true, '', {isAdmin: false}));
    }
    const groupInDatabase = await AccountTable.getAdministratingGroupByUsernameAndGroupId(username, group.id);
    return new ServiceResponse<{ isAdmin: boolean }>(200, {},
        new ResponseBody<{ isAdmin: boolean }>(true, '', {isAdmin: groupInDatabase !== null}));
}