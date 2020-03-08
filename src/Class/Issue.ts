export class Issue
{
    public readonly id: number;
    public readonly username: string;
    public readonly repositoryUsername: string;
    public readonly repositoryName: string;
    public readonly no: number;
    public readonly title: string;
    public readonly creationTime: number;
    public readonly modificationTime: number;

    constructor(id: number, username: string, repositoryUsername: string, repositoryName: string, no: number, title: string, creationTime: number, modificationTime: number)
    {
        this.id = id;
        this.username = username;
        this.repositoryUsername = repositoryUsername;
        this.repositoryName = repositoryName;
        this.no = no;
        this.title = title;
        this.creationTime = creationTime;
        this.modificationTime = modificationTime;
    }

    public static validate(issue: Readonly<Record<keyof Issue, any>>): boolean
    {
        const {id, username, repositoryUsername, repositoryName, no, title, creationTime, modificationTime} = issue;
        return typeof id === 'number'
            && typeof username === 'string'
            && typeof repositoryUsername === 'string'
            && typeof repositoryName === 'string'
            && typeof no === 'number'
            && typeof title === 'string'
            && typeof creationTime === 'number'
            && typeof modificationTime === 'number';
    }

    public static from(issue: Readonly<Record<keyof Issue, any>>): Issue
    {
        if (!Issue.validate(issue))
        {
            throw new TypeError();
        }
        const {id, username, repositoryUsername, repositoryName, no, title, creationTime, modificationTime} = issue;
        return new Issue(id, username, repositoryUsername, repositoryName, no, title, creationTime, modificationTime);
    }
}