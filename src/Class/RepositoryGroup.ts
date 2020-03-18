export class RepositoryGroup
{
    public readonly repositoryUsername: string;
    public readonly repositoryName: string;
    public readonly groupId: number;

    constructor(repositoryUsername: string, repositoryName: string, groupId: number)
    {
        this.repositoryUsername = repositoryUsername;
        this.repositoryName = repositoryName;
        this.groupId = groupId;
    }

    public static validate(repositoryGroup: Readonly<Record<keyof RepositoryGroup, any>>): boolean
    {
        const {repositoryUsername, repositoryName, groupId} = repositoryGroup;
        return typeof repositoryUsername === 'string'
            && typeof repositoryName === 'string'
            && typeof groupId === 'number';
    }

    public static from(repositoryGroup: Readonly<Record<keyof RepositoryGroup, any>>): RepositoryGroup
    {
        if (!RepositoryGroup.validate(repositoryGroup))
        {
            throw new TypeError();
        }
        const {repositoryUsername, repositoryName, groupId} = repositoryGroup;
        return new RepositoryGroup(repositoryUsername, repositoryName, groupId);
    }
}