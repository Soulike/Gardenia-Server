import {ISSUE_STATUS} from '../CONSTANT';

export class Issue
{
    public readonly id: number;
    public readonly username: string;
    public readonly repositoryUsername: string;
    public readonly repositoryName: string;
    public readonly no: number;
    public readonly title: string;
    public readonly status: ISSUE_STATUS;
    public readonly creationTime: number;
    public readonly modificationTime: number;

    constructor(id: number, username: string, repositoryUsername: string, repositoryName: string, no: number, title: string, status: ISSUE_STATUS, creationTime: number, modificationTime: number)
    {
        this.id = id;
        this.username = username;
        this.repositoryUsername = repositoryUsername;
        this.repositoryName = repositoryName;
        this.no = no;
        this.title = title;
        this.status = status;
        this.creationTime = creationTime;
        this.modificationTime = modificationTime;
    }

    public static validate(issue: Readonly<Record<keyof Issue, any>>): boolean
    {
        const {id, username, repositoryUsername, repositoryName, no, title, status, creationTime, modificationTime} = issue;
        return typeof id === 'number'
            && typeof username === 'string'
            && typeof repositoryUsername === 'string'
            && typeof repositoryName === 'string'
            && typeof no === 'number'
            && typeof title === 'string'
            && Object.values(ISSUE_STATUS).includes(status)
            && typeof creationTime === 'number'
            && typeof modificationTime === 'number';
    }

    public static from(issue: Readonly<Record<keyof Issue, any>>): Issue
    {
        if (!Issue.validate(issue))
        {
            throw new TypeError();
        }
        const {id, username, repositoryUsername, repositoryName, no, title, status, creationTime, modificationTime} = issue;
        return new Issue(id, username, repositoryUsername, repositoryName, no, title, status, creationTime, modificationTime);
    }
}