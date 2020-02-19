export class PullRequestComment
{
    public readonly id: number | undefined;
    public readonly username: string;
    public readonly belongsTo: number;
    public readonly content: string;
    public readonly createTime: number;

    constructor(id: number | undefined, username: string, belongsTo: number, content: string, createTime: number)
    {
        this.id = id;
        this.username = username;
        this.belongsTo = belongsTo;
        this.content = content;
        this.createTime = createTime;
    }

    public static validate(pullRequestComment: Readonly<Record<keyof PullRequestComment, any>>): boolean
    {
        const {id, username, belongsTo, content, createTime} = pullRequestComment;
        return (typeof id === 'number' || id === undefined)
            && typeof username === 'string'
            && typeof belongsTo === 'number'
            && typeof content === 'string'
            && typeof createTime === 'number';
    }

    public static from(pullRequestComment: Readonly<Record<keyof PullRequestComment, any>>): PullRequestComment
    {
        if (!PullRequestComment.validate(pullRequestComment))
        {
            throw new TypeError();
        }
        const {id, username, belongsTo, content, createTime} = pullRequestComment;
        return new PullRequestComment(id, username, belongsTo, content, createTime);
    }
}