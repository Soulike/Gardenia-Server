import {Account, Repository as RepositoryClass} from '../Class';

export function repositoryIsAvailableToTheViewer(repository: Readonly<RepositoryClass | null>, viewer: Readonly<Pick<Account, 'username'>>): boolean
{
    let isAvailable = false;
    if (repository === null)
    {
        isAvailable = false;
    }
    else    // repository !== null
    {
        const {isPublic} = repository;
        if (isPublic)
        {
            isAvailable = true;
        }
        else    // !isPublic
        {
            const {username} = repository;
            const {username: usernameOfViewer} = viewer;
            isAvailable = username === usernameOfViewer;
        }
    }
    return isAvailable;
}