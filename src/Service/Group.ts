import {Account, Group, Repository, ResponseBody, ServiceResponse} from '../Class';
import {
    Account as AccountTable,
    AccountGroup as AccountGroupTable,
    Group as GroupTable,
    Repository as RepositoryTable,
    RepositoryGroup as RepositoryGroupTable,
} from '../Database';
import {Group as GroupFunction, Repository as RepositoryFunction} from '../Function';

export async function add(group: Readonly<Omit<Group, 'id'>>, usernameInSession: Account['username']): Promise<ServiceResponse<Pick<Group, 'id'> | void>>
{
    const {name} = group;
    if (await GroupFunction.groupNameExists({username: usernameInSession}, {name}))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `已存在同名小组`));
    }
    const groupId = await GroupTable.insertAndReturnId({name}, usernameInSession);
    return new ServiceResponse<Pick<Group, 'id'>>(200, {},
        new ResponseBody<Pick<Group, 'id'>>(true, '', {id: groupId}));
}

export async function dismiss(group: Readonly<Pick<Group, 'id'>>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {id} = group;
    if (!(await GroupFunction.isGroupAdmin({id}, usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `您不是小组 #${id} 的管理员`));
    }
    await GroupTable.deleteById(id);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function info(group: Readonly<Pick<Group, 'id'>>): Promise<ServiceResponse<Group | null>>
{
    const {id: groupId} = group;
    const groupInDatabase = await GroupTable.selectById(groupId);
    if (groupInDatabase === null)
    {
        return new ServiceResponse<null>(404, {},
            new ResponseBody(true, '', null));
    }
    return new ServiceResponse<Group>(200, {},
        new ResponseBody<Group>(true, '', groupInDatabase));
}

export async function changeName(group: Readonly<Pick<Group, 'id' | 'name'>>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {id: groupId, name: newName} = group;
    if (await GroupTable.count({id: groupId}) === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `小组 #${groupId} 不存在`));
    }
    if (!(await GroupFunction.isGroupAdmin(group, usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `您不是小组 #${groupId} 的管理员`));
    }
    await GroupTable.update({name: newName}, {id: groupId});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function accounts(group: Readonly<Pick<Group, 'id'>>): Promise<ServiceResponse<Account[] | void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `小组 #${groupId} 不存在`));
    }
    const accountGroups = await AccountGroupTable.select({groupId});
    const accounts = await Promise.all(accountGroups.map(async ({username}) => (await AccountTable.selectByUsername(username))!));
    return new ServiceResponse<Account[]>(200, {},
        new ResponseBody<Account[]>(true, '', accounts));
}

export async function addAccounts(group: Readonly<Pick<Group, 'id'>>, usernames: Readonly<string[]>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `小组 #${groupId} 不存在`));
    }
    if (!(await GroupFunction.isGroupAdmin(group, usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `您不是小组 #${groupId} 的管理员`));
    }
    for (const username of usernames)
    {
        if (await AccountTable.selectByUsername(username) === null)
        {
            return new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, `用户 ${username} 不存在`));
        }
    }
    await Promise.all(usernames.map(async username =>
    {
        if ((await AccountGroupTable.select({groupId, username})).length === 0)
        {
            await AccountGroupTable.insert({groupId, username, isAdmin: false});
        }
    }));
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function removeAccounts(group: Readonly<Pick<Group, 'id'>>, usernames: Readonly<string[]>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `小组 #${groupId} 不存在`));
    }
    if (!(await GroupFunction.isGroupAdmin(group, usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `您不是小组 #${groupId} 的管理员`));
    }
    if (usernames.includes(usernameInSession))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '不能从小组中移除自己'));
    }
    await Promise.all(usernames.map(async username => await AccountGroupTable.del({username, groupId})));
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function getByAccount(account: Readonly<Pick<Account, 'username'>>): Promise<ServiceResponse<Group[]>>
{
    const {username} = account;
    if (await AccountTable.count({username}) === 0)
    {
        return new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, `用户 ${username} 不存在`));
    }
    const accountGroups = await AccountGroupTable.select({username});
    const groups = await Promise.all(accountGroups.map(async ({groupId}) => (await GroupTable.selectById(groupId))!));
    return new ServiceResponse<Group[]>(200, {},
        new ResponseBody<Group[]>(true, '', groups));
}

export async function getAdministratingByAccount(account: Readonly<Pick<Account, 'username'>>): Promise<ServiceResponse<Group[]>>
{
    const {username} = account;
    if (await AccountTable.count({username}) === 0)
    {
        return new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, `用户 ${username} 不存在`));
    }
    const accountGroups = await AccountGroupTable.select({username, isAdmin: true});
    const groups = await Promise.all(accountGroups.map(async ({groupId}) => (await GroupTable.selectById(groupId))!));
    return new ServiceResponse<Group[]>(200, {},
        new ResponseBody<Group[]>(true, '', groups));
}

export async function admins(group: Readonly<Pick<Group, 'id'>>): Promise<ServiceResponse<Account[] | void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `小组 #${groupId} 不存在`));
    }
    const accountGroups = await AccountGroupTable.select({groupId, isAdmin: true});
    const accounts = await Promise.all(accountGroups.map(async ({username}) => (await AccountTable.selectByUsername(username))!));
    return new ServiceResponse<Account[]>(200, {},
        new ResponseBody<Account[]>(true, '', accounts));
}

export async function addAdmins(group: Readonly<Pick<Group, 'id'>>, usernames: Readonly<string[]>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `小组 #${groupId} 不存在`));
    }
    if (!(await GroupFunction.isGroupAdmin(group, usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `您不是小组 #${groupId} 的管理员`));
    }
    for (const username of usernames)
    {
        if (await AccountTable.selectByUsername(username) === null)
        {
            return new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, `用户 ${username} 不存在`));
        }
        if (!(await GroupFunction.isGroupMember(group, username)))
        {
            return new ServiceResponse<void>(403, {},
                new ResponseBody<void>(false, `用户 ${username} 不是小组 #${groupId} 的成员`));
        }
    }
    await Promise.all(usernames.map(async username => await AccountGroupTable.update(
        {isAdmin: true},
        {username, groupId})));
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function removeAdmins(group: Readonly<Pick<Group, 'id'>>, usernames: Readonly<string[]>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `小组 #${groupId} 不存在`));
    }
    if (!(await GroupFunction.isGroupAdmin(group, usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `您不是小组 #${groupId} 的管理员`));
    }
    if (usernames.includes(usernameInSession))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '不能撤销自己的管理员权限'));
    }
    await Promise.all(usernames.map(async username => await AccountGroupTable.update(
        {isAdmin: false},
        {username, groupId})));
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function getByRepository(repository: Readonly<Pick<Repository, 'username' | 'name'>>, usernameInSession?: Account['username']): Promise<ServiceResponse<Group[]>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryGroups = await RepositoryGroupTable.select({repositoryUsername: username, repositoryName: name});
    const groups = await Promise.all(repositoryGroups.map(async ({groupId}) => (await GroupTable.selectById(groupId))!));
    return new ServiceResponse<Group[]>(200, {},
        new ResponseBody<Group[]>(true, '', groups));
}

export async function repositories(group: Readonly<Pick<Group, 'id'>>): Promise<ServiceResponse<Repository[] | void>>
{
    const {id: groupId} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<Repository[]>(404, {},
            new ResponseBody<Repository[]>(false, `小组 #${groupId} 不存在`));
    }
    const repositoryGroups = await RepositoryGroupTable.select({groupId});
    const repositories = await Promise.all(repositoryGroups.map(async ({repositoryUsername, repositoryName}) =>
        (await RepositoryTable.selectByUsernameAndName({username: repositoryUsername, name: repositoryName}))!));
    return new ServiceResponse<Repository[]>(200, {},
        new ResponseBody<Repository[]>(true, '', repositories));
}

export async function addRepository(group: Readonly<Pick<Group, 'id'>>, repository: Readonly<Pick<Repository, 'username' | 'name'>>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    // 查看 group 是否存在
    const {id: groupId} = group;
    if (await GroupTable.count({id: groupId}) === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `小组 #${groupId} 不存在`));
    }
    // 查看仓库是否存在
    const {username, name} = repository;
    if (await RepositoryTable.count({username, name}) === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    // 查看仓库是不是已经在小组中
    if (await RepositoryGroupTable.count({repositoryUsername: username, repositoryName: name, groupId}) !== 0)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `仓库 ${username}/${name} 已存在于小组 #${groupId} 中`));
    }
    // 查看仓库创建者是不是小组成员
    if (await AccountGroupTable.count({username, groupId}) === 0)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `仓库 ${username}/${name} 的创建者不是小组 #${groupId} 的成员`));
    }
    // 查看是不是小组管理员或者仓库创建者
    if (!await GroupFunction.isGroupAdmin({id: groupId}, usernameInSession)
        && usernameInSession !== username)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `您不是小组 #${groupId} 的管理员或仓库 ${username}/${name} 的创建者`));
    }
    await RepositoryGroupTable.insert({groupId, repositoryUsername: username, repositoryName: name});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function removeRepositories(group: Readonly<Pick<Group, 'id'>>, repositories: Pick<Repository, 'username' | 'name'>[], usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {id} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `小组 #${id} 不存在`));
    }
    if (!(await GroupFunction.isGroupAdmin(group, usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `您不是小组 #${id} 的管理员`));
    }
    for (const {username, name} of repositories)
    {
        if (await RepositoryTable.selectByUsernameAndName({username, name}) === null)
        {
            return new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, ` 仓库 ${username}/${name} 不存在`));
        }
    }
    const {id: groupId} = group;
    await Promise.all(repositories.map(async ({username, name}) =>
        await RepositoryGroupTable.del({
            groupId,
            repositoryUsername: username,
            repositoryName: name,
        })));
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function isAdmin(group: Readonly<Pick<Group, 'id'>>, usernameInSession?: Account['username']): Promise<ServiceResponse<{ isAdmin: boolean } | void>>
{
    const {id} = group;
    if (!(await GroupFunction.groupExists(group)))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `小组 #${id} 不存在`));
    }
    if (typeof usernameInSession !== 'string')
    {
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {isAdmin: false}));
    }
    const {id: groupId} = group;
    const isAdmin = await AccountGroupTable.count({groupId, username: usernameInSession, isAdmin: true}) === 1;
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {isAdmin}));
}