import {Account, Profile, Repository, ResponseBody, ServiceResponse, Star} from '../Class';
import {Profile as ProfileTable, Repository as RepositoryTable, Star as StarTable} from '../Database';
import {Repository as RepositoryFunction} from '../Function';

export async function add(repository: Pick<Repository, 'username' | 'name'>, username: Account['username']): Promise<ServiceResponse<void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null
        || !(await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username})))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const star = new Star(username, repository.username, repository.name);
    if ((await StarTable.count(star)) === 0)
    {
        await StarTable.insert(star);
    }
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function remove(repository: Pick<Repository, 'username' | 'name'>, username: Account['username']): Promise<ServiceResponse<void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const star = new Star(username, repository.username, repository.name);
    if ((await StarTable.count(star)) !== 0)
    {
        await StarTable.del(star);
    }
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function getStartedRepositories(username: Account['username']): Promise<ServiceResponse<{ repositories: Repository[] }>>
{
    const staredRepositoriesPk = await StarTable.select({username});
    const staredRepositories: Repository[] = [];
    await Promise.all(staredRepositoriesPk.map(
        async ({repository_username: username, repository_name: name}) =>
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

export async function isStaredRepository(repository: Pick<Repository, 'username' | 'name'>, username: Account['username']): Promise<ServiceResponse<{ isStared: boolean }>>
{
    const amount = await StarTable.count(new Star(username, repository.username, repository.name));
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {isStared: amount !== 0}));
}

export async function getRepositoryStarAmount(repository: Pick<Repository, 'username' | 'name'>, username?: Account['username']): Promise<ServiceResponse<{ amount: number } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null
        || !(await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username})))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const amount = await StarTable.count({
        repository_username: repository.username,
        repository_name: repository.name,
    });
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}

export async function getRepositoryStarUsers(repository: Pick<Repository, 'username' | 'name'>, username?: Account['username']): Promise<ServiceResponse<{ users: Profile[] } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null
        || !(await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username})))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryStars = await StarTable.select({
        repository_username: repository.username,
        repository_name: repository.name,
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