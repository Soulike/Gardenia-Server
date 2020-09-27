import {Account, Repository} from '../Class';
import {Repository as RepositoryTable} from '../Database/Table';

export async function hasModifyOptionAuthority(repository: Readonly<Pick<Repository, 'username' | 'name'>>, account: Readonly<Pick<Account, 'username'>>): Promise<boolean>
{
    const {username, name} = repository;
    const {username: visitorUsername} = account;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null)
    {
        return visitorUsername === username;
    }
    else    // repository === null
    {
        return false;
    }
}