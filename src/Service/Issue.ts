import {Account, Issue, IssueComment, Repository, ResponseBody, ServiceResponse} from '../Class';
import {Issue as IssueTable, IssueComment as IssueCommentTable, Repository as RepositoryTable} from '../Database';
import {Repository as RepositoryFunction} from '../Function';
import {ISSUE_STATUS} from '../CONSTANT';

export async function add(issue: Readonly<Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'title'>>, issueComment: Readonly<Pick<IssueComment, 'content'>>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {repositoryUsername, repositoryName, title} = issue;
    const {content} = issueComment;
    const repository = await RepositoryTable.selectByUsernameAndName({
        username: repositoryUsername,
        name: repositoryName,
    });
    if (repository === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repository, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${repositoryUsername}/${repositoryName} 不存在`));
    }
    const maxNo = await IssueTable.selectMaxNoOfRepository({repositoryUsername, repositoryName});
    const timestamp = Date.now();
    await IssueTable.insertAndReturnId({
        repositoryUsername,
        repositoryName,
        title,
        status: ISSUE_STATUS.OPEN,
        creationTime: timestamp,
        modificationTime: timestamp,
        username: usernameInSession,
        no: maxNo + 1,
    }, {
        content, modificationTime: timestamp, creationTime: timestamp,
    });
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function close(issue: Readonly<Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'no'>>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {repositoryUsername, repositoryName, no} = issue;
    const [issuesInDatabase, repository] = await Promise.all([
            IssueTable.select({repositoryUsername, repositoryName, no}),
            RepositoryTable.selectByUsernameAndName({
                username: repositoryUsername,
                name: repositoryName,
            }),
        ],
    );
    if (issuesInDatabase === null || issuesInDatabase.length === 0
        || repository === null
        || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repository, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `Issue #${no} 不存在`));
    }
    const {id, username} = issuesInDatabase[0];
    if (username !== usernameInSession  // 不是 Issue 的创建者
        && !await RepositoryFunction.repositoryIsModifiableToTheViewer(repository, {username: usernameInSession}))  // 也不是仓库的合作者
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `只有仓库 ${repositoryUsername}/${repositoryName} 的合作者与 Issue #${no} 的创建者可关闭 Issue`));
    }
    await IssueTable.update({status: ISSUE_STATUS.CLOSED}, {id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function reopen(issue: Readonly<Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'no'>>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {repositoryUsername, repositoryName, no} = issue;
    const [issuesInDatabase, repository] = await Promise.all([
            IssueTable.select({repositoryUsername, repositoryName, no}),
            RepositoryTable.selectByUsernameAndName({
                username: repositoryUsername,
                name: repositoryName,
            }),
        ],
    );
    if (issuesInDatabase === null || issuesInDatabase.length === 0
        || repository === null
        || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repository, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `Issue #${no} 不存在`));
    }
    const {id, username} = issuesInDatabase[0];
    if (username !== usernameInSession  // 不是 Issue 的创建者
        && !await RepositoryFunction.repositoryIsModifiableToTheViewer(repository, {username: usernameInSession}))  // 也不是仓库的合作者
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `只有仓库 ${repositoryUsername}/${repositoryName} 的合作者与 Issue #${no} 的创建者可开启 Issue`));
    }
    await IssueTable.update({status: ISSUE_STATUS.OPEN}, {id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function getByRepository(repository: Readonly<Pick<Repository, 'username' | 'name'>>, status: ISSUE_STATUS | undefined, offset?: number, limit?: number, usernameInSession?: Account['username']): Promise<ServiceResponse<{ issues: Issue[] } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({
        username, name,
    });
    if (repositoryInDatabase === null
        || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const issues = await IssueTable.select({repositoryUsername: username, repositoryName: name, status}, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {issues}));
}

export async function getAmountByRepository(repository: Readonly<Pick<Repository, 'username' | 'name'>>, status: ISSUE_STATUS | undefined, usernameInSession?: Account['username']): Promise<ServiceResponse<{ amount: number } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({
        username, name,
    });
    if (repositoryInDatabase === null
        || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const amount = await IssueTable.count({repositoryUsername: username, repositoryName: name, status});
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}

export async function get(issue: Readonly<Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'no'>>, usernameInSession?: Account['username']): Promise<ServiceResponse<Issue | null>>
{
    const {repositoryUsername, repositoryName, no} = issue;
    const [issuesInDatabase, repository] = await Promise.all([
            IssueTable.select({repositoryUsername, repositoryName, no}),
            RepositoryTable.selectByUsernameAndName({
                username: repositoryUsername,
                name: repositoryName,
            }),
        ],
    );
    if (issuesInDatabase === null || issuesInDatabase.length === 0
        || repository === null
        || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repository, {username: usernameInSession}))
    {
        return new ServiceResponse<null>(404, {},
            new ResponseBody(true, '', null));
    }
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', issuesInDatabase[0]));
}

export async function getComments(issue: Readonly<Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'no'>>, offset?: number, limit?: number, usernameInSession?: Account['username']): Promise<ServiceResponse<{ comments: IssueComment[] } | void>>
{
    const {repositoryUsername, repositoryName, no} = issue;
    const [issuesInDatabase, repository] = await Promise.all([
            IssueTable.select({repositoryUsername, repositoryName, no}),
            RepositoryTable.selectByUsernameAndName({
                username: repositoryUsername,
                name: repositoryName,
            }),
        ],
    );
    if (issuesInDatabase === null || issuesInDatabase.length === 0
        || repository === null
        || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repository, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `Issue #${no} 不存在`));
    }
    const {id} = issuesInDatabase[0];
    const comments = await IssueCommentTable.select({belongsTo: id}, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {comments}));
}

export async function addComment(issue: Readonly<Pick<Issue, 'repositoryUsername' | 'repositoryName' | 'no'>>, issueComment: Readonly<Pick<IssueComment, 'content'>>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    const {repositoryUsername, repositoryName, no} = issue;
    const [issuesInDatabase, repository] = await Promise.all([
            IssueTable.select({repositoryUsername, repositoryName, no}),
            RepositoryTable.selectByUsernameAndName({
                username: repositoryUsername,
                name: repositoryName,
            }),
        ],
    );
    if (issuesInDatabase === null || issuesInDatabase.length === 0
        || repository === null
        || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repository, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `Issue #${no} 不存在`));
    }
    const {id} = issuesInDatabase[0];
    const timestamp = Date.now();
    const {content} = issueComment;
    await IssueCommentTable.insertAndReturnId({
        username: usernameInSession,
        belongsTo: id!,
        creationTime: timestamp,
        modificationTime: timestamp,
        content,
    });
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}