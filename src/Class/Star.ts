import {Account} from './Account';
import {Repository} from './Repository';

export class Star
{
    public readonly username: Account['username'];
    public readonly repository_username: Repository['username'];
    public readonly repository_name: Repository['name'];

    constructor(username: string, repository_username: string, repository_name: string)
    {
        this.username = username;
        this.repository_username = repository_username;
        this.repository_name = repository_name;
    }

    public static from(obj: Readonly<Record<keyof Star, any>>): Star
    {
        const {username, repository_name, repository_username} = obj;
        if (!Star.validate({username, repository_name, repository_username}))
        {
            throw new TypeError(`Source object is not a ${Star.name} instance`);
        }
        return new Star(username, repository_username, repository_name);
    }

    private static validate(obj: Readonly<Record<keyof Star, any>>): boolean
    {
        const {username, repository_name, repository_username} = obj;
        return Account.validate({username, hash: 'a'.repeat(64)})
            && Repository.validate({
                username: repository_username,
                name: repository_name,
                isPublic: false,
                description: '',
            });
    }
}