import {Account, Repository} from '../Class';
import {Collaborate as CollaborateTable, Repository as RepositoryTable} from '../Database';

export async function hasReadAuthority(repository: Readonly<Pick<Repository, 'username' | 'name'>>, account: Readonly<Pick<Account, 'username'>>): Promise<boolean>
{
    const {username, name} = repository;
    const {username: visitorUsername} = account;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null)
    {
        const {isPublic} = repositoryInDatabase;
        if (isPublic)
        {
            return true;
        }
        else if (visitorUsername === username)    // !isPublic
        {
            return true;
        }
        else    // 私有仓库，而且不是创建者
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