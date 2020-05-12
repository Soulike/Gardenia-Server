import {Account, AccountRepository, Profile, Repository, ResponseBody, ServiceResponse} from '../Class';
import {Repository as RepositoryFunction} from '../Function';
import {
    Account as AccountTable,
    Collaborate as CollaborateTable,
    Profile as ProfileTable,
    Repository as RepositoryTable,
} from '../Database';

export async function generateCode(repository: Pick<Repository, 'username' | 'name'>, usernameInSession?: Account['username']): Promise<ServiceResponse<{ code: string } | void>>
{
    const {username, name} = repository;
    if (username !== usernameInSession)
    {
        return new ServiceResponse(200, {},
            new ResponseBody(false, `只有仓库 ${username}/${name} 的创建者可以生成邀请码`));
    }
    if (await RepositoryTable.count(repository) === 0)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const code = RepositoryFunction.generateCollaborateCode(repository);
    await RepositoryFunction.setCollaborateCode(code, repository);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {code}));
}

export async function add(code: string, username: Account['username']): Promise<ServiceResponse<void>>
{
    const repositoryPk = await RepositoryFunction.getCollaborateCodeRepository(code);
    if (repositoryPk === null)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '邀请码无效'));
    }
    const repository = await RepositoryTable.selectByUsernameAndName(repositoryPk);
    if (repository === null)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '邀请码无效'));
    }
    const account = await AccountTable.selectByUsername(username);
    if (account === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `用户 ${username} 不存在`));
    }
    const {username: repositoryUsername, name: repositoryName} = repository;
    if (username === repositoryUsername)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '不能添加自己为合作者'));
    }
    await CollaborateTable.insert(
        new AccountRepository(username, repositoryUsername, repositoryName));
    await RepositoryFunction.deleteCollaborateCode(code);
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function remove(repository: Pick<Repository, 'username' | 'name'>, account: Pick<Account, 'username'>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${repository.username}/${repository.name} 不存在`));
    }
    const {username} = account;
    const accountInDatabase = await AccountTable.selectByUsername(account.username);
    if (accountInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `用户 ${username} 不存在`));
    }
    if (!(await RepositoryFunction.repositoryIsModifiableToTheViewer(repositoryInDatabase, {username: usernameInSession})))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${repository.username}/${repository.name} 不存在`));
    }
    await CollaborateTable.del(
        new AccountRepository(username, repositoryInDatabase.username, repositoryInDatabase.name));
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function getCollaborators(repository: Pick<Repository, 'username' | 'name'>, username?: Account['username']): Promise<ServiceResponse<{ collaborators: Profile[] } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${repository.username}/${repository.name} 不存在`));
    }
    if (!(await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username})))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${repository.username}/${repository.name} 不存在`));
    }
    const {username: repositoryUsername, name: repositoryName} = repositoryInDatabase;
    const collaborations = await CollaborateTable.select({
        repositoryUsername: repositoryUsername,
        repositoryName: repositoryName,
    });
    const collaboratorProfilesWithNull = await Promise.all(
        collaborations.map(async ({username}) => await ProfileTable.selectByUsername(username)),
    );
    const collaboratorProfiles: Profile[] = [];
    collaboratorProfilesWithNull.forEach(profile =>
    {
        if (profile !== null)
        {
            collaboratorProfiles.push(profile);
        }
    });
    return new ServiceResponse<{ collaborators: Profile[] }>(200, {},
        new ResponseBody(true, '', {collaborators: collaboratorProfiles}));
}

export async function getCollaboratorsAmount(repository: Pick<Repository, 'username' | 'name'>, username?: Account['username']): Promise<ServiceResponse<{ amount: number } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${repository.username}/${repository.name} 不存在`));
    }
    if (!(await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username})))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${repository.username}/${repository.name} 不存在`));
    }
    const {username: repositoryUsername, name: repositoryName} = repositoryInDatabase;
    const amount = await CollaborateTable.count({
        repositoryUsername: repositoryUsername,
        repositoryName: repositoryName,
    });
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}

export async function getCollaboratingRepositories(account: Pick<Account, 'username'>, usernameInSession?: Account['username']): Promise<ServiceResponse<{ repositories: Repository[] } | void>>
{
    const {username} = account;
    if (await AccountTable.count({username}) === 0)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(true, `用户 ${username} 不存在`));
    }
    const repositoryPks = await CollaborateTable.select({username});
    const repositoriesWithNull = await Promise.all(
        repositoryPks.map(async ({repositoryUsername: username, repositoryName: name}) =>
            await RepositoryTable.selectByUsernameAndName({username, name})),
    );
    const repositories: Repository[] = [];
    if (username !== usernameInSession)  // 不是本人请求，只返回公有仓库
    {
        repositoriesWithNull.forEach(repository =>
        {
            if (repository !== null && repository.isPublic)
            {
                repositories.push(repository);
            }
        });
    }
    else    // 本人请求，返回所有仓库
    {
        repositoriesWithNull.forEach(repository =>
        {
            if (repository !== null)
            {
                repositories.push(repository);
            }
        });
    }

    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {repositories}));
}

export async function getCollaboratingRepositoriesAmount(account: Pick<Account, 'username'>): Promise<ServiceResponse<{ amount: number } | void>>
{
    const {username} = account;
    if (await AccountTable.count({username}) === 0)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(true, `用户 ${username} 不存在`));
    }
    const amount = await CollaborateTable.count({username});
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}