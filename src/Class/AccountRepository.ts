import {Account} from './Account';
import {Repository} from './Repository';

export class AccountRepository
{
    public readonly username: Account['username'];
    public readonly repositoryUsername: Repository['username'];
    public readonly repositoryName: Repository['name'];

    constructor(username: string, repositoryUsername: string, repositoryName: string)
    {
        this.username = username;
        this.repositoryUsername = repositoryUsername;
        this.repositoryName = repositoryName;
    }

    public static from(obj: Readonly<Record<keyof AccountRepository, any>>): AccountRepository
    {
        const {username, repositoryName, repositoryUsername} = obj;
        if (!AccountRepository.validate({username, repositoryName, repositoryUsername}))
        {
            throw new TypeError(`Source object is not a ${AccountRepository.name} instance`);
        }
        return new AccountRepository(username, repositoryUsername, repositoryName);
    }

    private static validate(obj: Readonly<Record<keyof AccountRepository, any>>): boolean
    {
        const {username, repositoryName, repositoryUsername} = obj;
        return Account.validate({username, hash: 'a'.repeat(64)})
            && Repository.validate({
                username: repositoryUsername,
                name: repositoryName,
                isPublic: false,
                description: '',
            });
    }
}