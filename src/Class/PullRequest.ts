import {PULL_REQUEST_STATUS} from '../CONSTANT';

export class PullRequest
{
    public readonly id: number | undefined;
    public readonly no: number;
    public readonly sourceRepositoryUsername: string;
    public readonly sourceRepositoryName: string;
    public readonly sourceRepositoryBranch: string;
    public readonly targetRepositoryUsername: string;
    public readonly targetRepositoryName: string;
    public readonly targetRepositoryBranch: string;
    public readonly createTime: number;
    public readonly title: string;
    public readonly content: string;
    public readonly status: PULL_REQUEST_STATUS;

    constructor(id: number | undefined, no: number,
                sourceRepositoryUsername: string, sourceRepositoryName: string, sourceRepositoryBranch: string,
                targetRepositoryUsername: string, targetRepositoryName: string, targetRepositoryBranch: string,
                createTime: number, title: string, content: string, status: PULL_REQUEST_STATUS)
    {
        this.id = id;
        this.no = no;
        this.sourceRepositoryUsername = sourceRepositoryUsername;
        this.sourceRepositoryName = sourceRepositoryName;
        this.sourceRepositoryBranch = sourceRepositoryBranch;
        this.targetRepositoryUsername = targetRepositoryUsername;
        this.targetRepositoryName = targetRepositoryName;
        this.targetRepositoryBranch = targetRepositoryBranch;
        this.createTime = createTime;
        this.title = title;
        this.content = content;
        this.status = status;
    }

    public static validate(pullRequest: Readonly<Record<keyof PullRequest, any>>): boolean
    {
        const {
            id, no,
            sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
            targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
            createTime, title, content, status,
        } = pullRequest;
        return (typeof id === 'number' || id === undefined)
            && typeof no === 'number'
            && typeof sourceRepositoryUsername === 'string'
            && typeof sourceRepositoryName === 'string'
            && typeof sourceRepositoryBranch === 'string'
            && typeof targetRepositoryUsername === 'string'
            && typeof targetRepositoryName === 'string'
            && typeof targetRepositoryBranch === 'string'
            && typeof createTime === 'number'
            && typeof title === 'string'
            && typeof content === 'string'
            && Object.values(PULL_REQUEST_STATUS).includes(status);
    }

    public static from(pullRequest: Readonly<Record<keyof PullRequest, any>>): PullRequest
    {
        if (!PullRequest.validate(pullRequest))
        {
            throw new TypeError();
        }
        const {
            id, no,
            sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
            targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
            createTime, title, content, status,
        } = pullRequest;
        return new PullRequest(id, no,
            sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
            targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
            createTime, title, content, status);
    }
}