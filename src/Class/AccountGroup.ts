export class AccountGroup
{
    public readonly username: string;
    public readonly groupId: number;
    public readonly isAdmin: boolean;

    constructor(username: string, groupId: number, isAdmin: boolean)
    {
        this.username = username;
        this.groupId = groupId;
        this.isAdmin = isAdmin;
    }

    public static validate(accountGroup: Readonly<Record<keyof AccountGroup, any>>): boolean
    {
        const {username, isAdmin, groupId} = accountGroup;
        return typeof username === 'string'
            && typeof isAdmin === 'boolean'
            && typeof groupId === 'number';
    }

    public static from(accountGroup: Readonly<Record<keyof AccountGroup, any>>): AccountGroup
    {
        if (!AccountGroup.validate(accountGroup))
        {
            throw new TypeError();
        }
        const {username, isAdmin, groupId} = accountGroup;
        return new AccountGroup(username, groupId, isAdmin);
    }
}