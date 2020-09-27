import {Account, AccountRepository, Profile, Repository, ResponseBody, ServiceResponse} from '../Class';
import {Profile as ProfileTable, Repository as RepositoryTable, Star as StarTable} from '../Database';
import {ILoggedInSession, ISession} from '../Interface';
import {hasReadAuthority} from '../RepositoryAuthorityCheck';

export async function add(repository: Pick<Repository, 'username' | 'name'>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null
        || !(await hasReadAuthority(repositoryInDatabase, {username: usernameInSession})))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const star = new AccountRepository(usernameInSession, repository.username, repository.name);
    if ((await StarTable.count(star)) === 0)
    {
        await StarTable.insert(star);
    }
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function remove(repository: Pick<Repository, 'username' | 'name'>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null
        || !(await hasReadAuthority(repositoryInDatabase, {username: usernameInSession})))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const star = new AccountRepository(usernameInSession, repository.username, repository.name);
    if ((await StarTable.count(star)) !== 0)
    {
        await StarTable.del(star);
    }
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function getStartedRepositories(username: Account['username'], offset: number, limit: number): Promise<ServiceResponse<{ repositories: Repository[] }>>
{
    const staredRepositoriesPk = await StarTable.select({username}, offset, limit);
    const staredRepositories: Repository[] = [];
    await Promise.all(staredRepositoriesPk.map(
        async ({repositoryUsername: username, repositoryName: name}) =>
        {
            staredRepositories.push(...(await RepositoryTable.select({
                username, name,
            })));
        },
    ));
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {repositories: staredRepositories}));
}

export async function getStaredRepositoriesAmount(username: Account['username']): Promise<ServiceResponse<{ amount: number }>>
{
    const amount = await StarTable.count({username});
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}

export async function isStaredRepository(repository: Pick<Repository, 'username' | 'name'>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ isStared: boolean }>>
{
    if (typeof usernameInSession !== 'string')
    {
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {isStared: false}));
    }
    const amount = await StarTable.count(new AccountRepository(usernameInSession, repository.username, repository.name));
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {isStared: amount !== 0}));
}

export async function getRepositoryStarAmount(repository: Pick<Repository, 'username' | 'name'>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ amount: number } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null
        || !(await hasReadAuthority(repositoryInDatabase, {username: usernameInSession})))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const amount = await StarTable.count({
        repositoryUsername: username,
        repositoryName: name,
    });
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}

export async function getRepositoryStarUsers(repository: Pick<Repository, 'username' | 'name'>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ users: Profile[] } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null
        || !(await hasReadAuthority(repositoryInDatabase, {username: usernameInSession})))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryStars = await StarTable.select({
        repositoryUsername: username,
        repositoryName: name,
    });
    const repositoryStarUserProfiles: Profile[] = [];
    await Promise.all(repositoryStars.map(async star =>
    {
        const profile = await ProfileTable.selectByUsername(star.username);
        if (profile !== null)
        {
            repositoryStarUserProfiles.push(profile);
        }
    }));
    return new ServiceResponse(200, {},
        new ResponseBody(true, '',
            {users: repositoryStarUserProfiles}));
}