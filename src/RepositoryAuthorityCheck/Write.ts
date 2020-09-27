import {Account, Repository} from '../Class';
import {Collaborate as CollaborateTable, Repository as RepositoryTable} from '../Database/Table';

export async function hasWriteAuthority(repository: Readonly<Pick<Repository, 'username' | 'name'>>, account: Readonly<Pick<Account, 'username'>>): Promise<boolean>
{
    const {username, name} = repository;
    const {username: visitorUsername} = account;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null)
    {
        if (visitorUsername === username)
        {
            return true;
        }
        else
        {
            const collaborateCount = await CollaborateTable.count({
                repositoryUsername: username,
                repositoryName: name,
                username: visitorUsername,
            });
            return collaborateCount !== 0;
        }
    }
    else    // repository === null
    {
        return false;
    }
}