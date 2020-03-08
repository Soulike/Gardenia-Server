import {Account, Issue, IssueComment, ResponseBody, ServiceResponse} from '../Class';
import {Issue as IssueTable, Repository as RepositoryTable} from '../Database';
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
            new ResponseBody(false, '仓库不存在'));
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
            new ResponseBody(false, 'Issue 不存在'));
    }
    const {id, username} = issuesInDatabase[0];
    if (username !== usernameInSession  // 不是 Issue 的创建者
        && !await RepositoryFunction.repositoryIsModifiableToTheViewer(repository, {username: usernameInSession}))  // 也不是仓库的合作者
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '只有仓库合作者与 Issue 创建者可关闭 Issue'));
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
            new ResponseBody(false, 'Issue 不存在'));
    }
    const {id, username} = issuesInDatabase[0];
    if (username !== usernameInSession  // 不是 Issue 的创建者
        && !await RepositoryFunction.repositoryIsModifiableToTheViewer(repository, {username: usernameInSession}))  // 也不是仓库的合作者
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '只有仓库合作者与 Issue 创建者可开启 Issue'));
    }
    await IssueTable.update({status: ISSUE_STATUS.OPEN}, {id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}