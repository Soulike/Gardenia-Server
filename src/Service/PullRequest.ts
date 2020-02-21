import {
    Account,
    PullRequest,
    PullRequestComment,
    Repository,
    RepositoryRepository,
    ResponseBody,
    ServiceResponse,
} from '../Class';
import {
    Collaborate as CollaborateTable,
    Fork as ForkTable,
    PullRequest as PullRequestTable,
    PullRequestComment as PullRequestCommentTable,
    Repository as RepositoryTable,
} from '../Database';
import {Git, Repository as RepositoryFunction} from '../Function';
import {PULL_REQUEST_STATUS} from '../CONSTANT';

export async function add(pullRequest: Omit<PullRequest, 'id' | 'no' | 'creationTime' | 'modificationTime' | 'status'>, usernameInSession?: Account['username']): Promise<ServiceResponse<void>>
{
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
        content, title,
    } = pullRequest;
    // 检查源仓库存在性，检查是否有创建 PR 的权限
    const sourceRepositories = await RepositoryTable.select({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    if (sourceRepositories.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 不存在`));
    }
    else if (sourceRepositories[0].username !== usernameInSession)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '只有源仓库的创建者才可创建 Pull Request'));
    }
    // 检查目标仓库存在性，检查是否是 fork 关系
    const [targetRepositoryAmount, forkAmount] = await Promise.all([
        RepositoryTable.count({
            username: targetRepositoryUsername,
            name: targetRepositoryName,
        }),
        ForkTable.count(new RepositoryRepository(
            sourceRepositoryUsername, sourceRepositoryName,
            targetRepositoryUsername, targetRepositoryName,
        )),
    ]);
    if (targetRepositoryAmount === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 不存在`));
    }
    else if (forkAmount === 0)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false,
                `${targetRepositoryUsername}/${targetRepositoryName} 不是 ${sourceRepositoryUsername}/${sourceRepositoryName} 的 fork`));
    }
    // 检查两个仓库的被操作分支是否存在
    const sourceRepositoryPath = Git.generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = Git.generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranch),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranch} 不存在`));
    }
    else if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranch} 不存在`));
    }
    // 创建 PR
    const maxNo = await PullRequestTable.selectMaxNoOfRepository({
        sourceRepositoryUsername, sourceRepositoryName,
        targetRepositoryUsername, targetRepositoryName,
    });
    await PullRequestTable.insertAndReturnId(new PullRequest(
        undefined, maxNo + 1,
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
        Date.now(), Date.now(), title, content, PULL_REQUEST_STATUS.OPEN),
    );
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function update(primaryKey: Readonly<Pick<PullRequest, 'id'>>, pullRequest: Readonly<Partial<Pick<PullRequest, 'title' | 'content'>>>, usernameInSession?: Account['username']): Promise<ServiceResponse<void>>
{
    // 检查 PR 是否存在
    const {id} = primaryKey;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 检查是否是创建者操作
    const {sourceRepositoryUsername} = pullRequests[0];
    if (usernameInSession !== sourceRepositoryUsername)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '只有 Pull Request 的创建者可进行修改'));
    }
    // 修改数据库
    const {title, content} = pullRequest;
    await PullRequestTable.update(
        {title, content, modificationTime: Date.now()}, {id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function close(pullRequest: Pick<PullRequest, 'id'>, usernameInSession?: Account['username']): Promise<ServiceResponse<void>>
{
    // 检查 PR 是否存在
    const {id} = pullRequest;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 检查是不是合作者操作
    const {targetRepositoryUsername, targetRepositoryName} = pullRequests[0];
    // 仓库一定存在
    const collaborates = await CollaborateTable.select({
        repository_username: targetRepositoryUsername,
        repository_name: targetRepositoryName,
    });
    const collaborators = collaborates.map(({username}) => username);
    if (usernameInSession === undefined
        || (usernameInSession !== targetRepositoryUsername
            && !collaborators.includes(usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '只有目标仓库的合作者可关闭 Pull Request'));
    }
    // 修改数据库
    await PullRequestTable.update(
        {status: PULL_REQUEST_STATUS.CLOSED}, {id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function isMergeable(pullRequest: Readonly<Pick<PullRequest, 'id'>>): Promise<ServiceResponse<{ isMergeable: boolean } | void>>
{
    // 检查 PR 是否存在
    const {id} = pullRequest;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 检查分支是否存在
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
    } = pullRequests[0];
    const sourceRepositoryPath = Git.generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = Git.generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranch),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranch} 不存在`));
    }
    else if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranch} 不存在`));
    }
    // 检查是否可合并
    const isMergeable = await Git.isMergeable(
        sourceRepositoryPath, sourceRepositoryBranch,
        targetRepositoryPath, targetRepositoryBranch,
    );
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {isMergeable}));
}

export async function merge(pullRequest: Readonly<Pick<PullRequest, 'id'>>, usernameInSession?: Account['username']): Promise<ServiceResponse<void>>
{
    // 检查 PR 是否存在
    const {id} = pullRequest;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 检查是不是合作者操作
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranch,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranch,
    } = pullRequests[0];
    // 仓库一定存在
    const collaborates = await CollaborateTable.select({
        repository_username: targetRepositoryUsername,
        repository_name: targetRepositoryName,
    });
    const collaborators = collaborates.map(({username}) => username);
    if (usernameInSession === undefined
        || (usernameInSession !== targetRepositoryUsername
            && !collaborators.includes(usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '只有目标仓库的合作者可合并 Pull Request'));
    }
    // 检查分支是否存在
    const sourceRepositoryPath = Git.generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = Git.generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranch),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranch} 不存在`));
    }
    else if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranch} 不存在`));
    }

    // 检查是否可合并
    const isMergeable = await Git.isMergeable(
        sourceRepositoryPath, sourceRepositoryBranch,
        targetRepositoryPath, targetRepositoryBranch,
    );
    if (!isMergeable)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, 'Pull Request 存在冲突，请解决冲突后再合并'));
    }
    // 进行合并操作
    await Git.merge(
        sourceRepositoryPath, sourceRepositoryBranch,
        targetRepositoryPath, targetRepositoryBranch,
    );
    // merge 成功再改动数据库
    await PullRequestTable.update(
        {status: PULL_REQUEST_STATUS.MERGED},
        {id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function get(pullRequest: Readonly<Pick<PullRequest, 'id'>>, usernameInSession: Account['username'] | undefined): Promise<ServiceResponse<PullRequest | void>>
{
    // 获取 PR 数据库信息
    const {id} = pullRequest;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 访问权限查看
    const {targetRepositoryUsername, targetRepositoryName} = pullRequests[0];
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(
        repositories[0],    // 一定存在
        {username: usernameInSession}))
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 返回 PR
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', pullRequests[0]));
}

export async function getByRepository(repository: Pick<Repository, 'username' | 'name'>, status: PULL_REQUEST_STATUS | undefined, usernameInSession: Account['username'] | undefined): Promise<ServiceResponse<{ pullRequests: PullRequest[] } | void>>
{
    // 获取仓库数据库信息
    const {username, name} = repository;
    const repositories = await RepositoryTable.select({username, name});
    if (repositories.length === 0)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    // 查看访问权限
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositories[0], {username: usernameInSession}))
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    // 获取 PR 列表
    const pullRequests = await PullRequestTable.select({
        targetRepositoryUsername: username,
        targetRepositoryName: name,
        status,
    });
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {pullRequests}));
}

export async function addComment(pullRequestComment: Readonly<Omit<PullRequestComment, 'id' | 'username' | 'creationTime' | 'modificationTime'>>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    // 查看 PR 是否存在
    const {belongsTo, content} = pullRequestComment;
    const pullRequests = await PullRequestTable.select({id: belongsTo});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 查看提交者是否有权限
    const {targetRepositoryUsername, targetRepositoryName} = pullRequests[0];
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(
        repositories[0],    // 一定存在
        {username: usernameInSession},
    ))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 添加评论
    await PullRequestCommentTable.insertAndReturnId(new PullRequestComment(
        undefined, usernameInSession,
        belongsTo, content, Date.now(), Date.now(),
    ));
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function updateComment(primaryKey: Readonly<Pick<PullRequestComment, 'id'>>, pullRequestComment: Readonly<Pick<PullRequestComment, 'content'>>, usernameInSession: Account['username']): Promise<ServiceResponse<void>>
{
    // 查看评论是否存在
    const {id} = primaryKey;
    const pullRequestComments = await PullRequestCommentTable.select({id});
    if (pullRequestComments.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '评论不存在'));
    }
    // 查看是否是本人修改
    const {username} = pullRequestComments[0];
    if (username !== usernameInSession)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '仅本人可编辑评论'));
    }
    // 进行修改
    const {content} = pullRequestComment;
    await PullRequestCommentTable.update({
        content,
        modificationTime: Date.now(),
    }, {id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function getComments(pullRequest: Readonly<Pick<PullRequest, 'id'>>, usernameInSession: Account['username'] | undefined): Promise<ServiceResponse<{ comments: PullRequestComment[] } | void>>
{
    // 获取 PR 数据库信息
    const {id} = pullRequest;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 查看访问权限
    const {targetRepositoryUsername, targetRepositoryName} = pullRequests[0];
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(
        repositories[0],    // 一定存在
        {username: usernameInSession},
    ))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 获取所有评论
    const pullRequestComments = await PullRequestCommentTable.select({
        belongsTo: id,
    });
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {comments: pullRequestComments}));
}