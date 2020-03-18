export class AccountGroup
{
    public readonly username: string;
    public readonly groupId: number;
    public readonly isPublic: boolean;

    constructor(username: string, groupId: number, isPublic: boolean)
    {
        this.username = username;
        this.groupId = groupId;
        this.isPublic = isPublic;
    }

    public static validate(accountGroup: Readonly<Record<keyof AccountGroup, any>>): boolean
    {
        const {username, isPublic, groupId} = accountGroup;
        return typeof username === 'string'
            && typeof isPublic === 'boolean'
            && typeof groupId === 'number';
    }

    public static from(accountGroup: Readonly<Record<keyof AccountGroup, any>>): AccountGroup
    {
        if (!AccountGroup.validate(accountGroup))
        {
            throw new TypeError();
        }
        const {username, isPublic, groupId} = accountGroup;
        return new AccountGroup(username, groupId, isPublic);
    }
}