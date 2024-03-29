import {
    Commit,
    Conflict,
    FileDiff,
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
    IssueAndPullRequest,
    Profile as ProfileTable,
    PullRequest as PullRequestTable,
    PullRequestComment as PullRequestCommentTable,
    Repository as RepositoryTable,
} from '../Database';
import {PULL_REQUEST_STATUS} from '../CONSTANT';
import {generateRepositoryPath} from '../Function/Repository';
import * as Git from '../Git';
import {getChangedFilesBetweenRepositoriesCommits, updateRelatedPullRequest} from '../Git';
import {ILoggedInSession, ISession} from '../Interface';
import {hasReadAuthority} from '../RepositoryAuthorityCheck';

export async function add(pullRequest: Readonly<Omit<PullRequest, 'id' | 'no' | 'sourceRepositoryCommitHash' | 'targetRepositoryCommitHash' | 'creationTime' | 'modificationTime' | 'status'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName,
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
    if (sourceRepositories[0].username !== usernameInSession)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `只有源仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 的创建者才可创建 Pull Request`));
    }
    // 检查目标仓库存在性，检查是否是 fork 关系
    const [targetRepositoryAmount, forkAmount] = await Promise.all([
        RepositoryTable.count({
            username: targetRepositoryUsername,
            name: targetRepositoryName,
        }),
        ForkTable.count(new RepositoryRepository(
            targetRepositoryUsername, targetRepositoryName,
            sourceRepositoryUsername, sourceRepositoryName,
        )),
    ]);
    if (targetRepositoryAmount === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 不存在`));
    }
    if (forkAmount === 0 && !(sourceRepositoryUsername === targetRepositoryUsername
        && sourceRepositoryName === targetRepositoryName))    // 既不是 fork 关系，也不是在同一个仓库内
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false,
                `${sourceRepositoryUsername}/${sourceRepositoryName} 不是 ${targetRepositoryUsername}/${targetRepositoryName} 的 fork`));
    }
    // 检查两个仓库的被操作分支是否存在
    const sourceRepositoryPath = generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranchName),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranchName),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranchName} 不存在`));
    }
    else if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranchName} 不存在`));
    }
    // 创建 PR
    // 获取编号
    const maxNo = await IssueAndPullRequest.selectMaxNoOfRepository({
        username: targetRepositoryUsername, name: targetRepositoryName,
    });
    // 获取双方 commit hash
    const sourceRepositoryCommitHash = await Git.getLastCommitHash(sourceRepositoryPath, sourceRepositoryBranchName);
    const targetRepositoryCommitHash = await Git.getLastCommitHash(targetRepositoryPath, targetRepositoryBranchName);
    await PullRequestTable.insertAndReturnId(new PullRequest(
        undefined, maxNo + 1,
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName, sourceRepositoryCommitHash,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName, targetRepositoryCommitHash,
        Date.now(), Date.now(), title, content, PULL_REQUEST_STATUS.OPEN),
    );
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function update(primaryKey: Readonly<Pick<PullRequest, 'id'>>, pullRequest: Readonly<Partial<Pick<PullRequest, 'title' | 'content'>>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    // 检查 PR 是否存在
    const {id} = primaryKey;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `Pull Request 不存在`));
    }
    // 检查是否是创建者操作
    const {sourceRepositoryUsername, no} = pullRequests[0];
    if (usernameInSession !== sourceRepositoryUsername)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `只有 Pull Request #${no} 的创建者可进行修改`));
    }
    // 修改数据库
    const {title, content} = pullRequest;
    await PullRequestTable.update(
        {title, content, modificationTime: Date.now()}, {id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function close(pullRequest: Pick<PullRequest, 'id'>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    // 检查 PR 是否存在
    const {id} = pullRequest;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 检查是不是合作者或者是 PR 创建者操作
    const {sourceRepositoryUsername, targetRepositoryUsername, targetRepositoryName, no} = pullRequests[0];
    // 仓库一定存在
    const collaborates = await CollaborateTable.select({
        repositoryUsername: targetRepositoryUsername,
        repositoryName: targetRepositoryName,
    });
    const collaborators = collaborates.map(({username}) => username);
    if (usernameInSession === undefined
        ||
        (usernameInSession !== targetRepositoryUsername
            && usernameInSession !== sourceRepositoryUsername
            && !collaborators.includes(usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `只有目标仓库 ${targetRepositoryUsername}/${targetRepositoryName} 的合作者或 Pull Request #${no} 的创建者可关闭 Pull Request`));
    }
    // 修改数据库
    await PullRequestTable.update(
        {status: PULL_REQUEST_STATUS.CLOSED}, {id});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function reopen(pullRequest: Readonly<Pick<PullRequest, 'id'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    // 检查 PR 是否存在
    const {id} = pullRequest;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName,
        no,
    } = pullRequests[0];
    // 检查源仓库、源仓库的分支、目标仓库的分支是否还都存在
    const sourceRepositoryAmount = await RepositoryTable.count({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    if (sourceRepositoryAmount === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 已不存在`));
    }
    const sourceRepositoryPath = generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranchName),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranchName),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranchName} 已不存在`));
    }
    else if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranchName} 已不存在`));
    }
    // 检查是不是目标仓库的合作者或 PR 创建者
    const targetRepositoryCollaboration = await CollaborateTable.select({
        repositoryUsername: targetRepositoryUsername,
        repositoryName: targetRepositoryName,
    });
    const collaborators = targetRepositoryCollaboration.map(({username}) => username);
    if (usernameInSession !== sourceRepositoryUsername      // 不是 PR 的发起者
        && usernameInSession !== targetRepositoryUsername   // 不是目标仓库的创建者
        && !collaborators.includes(usernameInSession))      // 不是目标仓库的合作者
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false,
                `只有目标仓库 ${targetRepositoryUsername}/${targetRepositoryName} 的合作者和 Pull Request #${no} 的创建者可重开 Pull Request`));
    }
    await PullRequestTable.update({status: PULL_REQUEST_STATUS.OPEN}, {id});
    return new ServiceResponse<void>(200, {}, new ResponseBody(true));
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
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName, status,
        no,
    } = pullRequests[0];
    // 检查是不是开启状态
    if (status !== PULL_REQUEST_STATUS.OPEN)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `Pull Request #${no} 已关闭`));
    }
    // 检查分支是否存在
    const sourceRepositoryPath = generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranchName),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranchName),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranchName} 不存在`));
    }
    else if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranchName} 不存在`));
    }
    // 检查是否可合并
    const isMergeable = await Git.isMergeable(
        sourceRepositoryPath, sourceRepositoryBranchName,
        targetRepositoryPath, targetRepositoryBranchName,
    );
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {isMergeable}));
}

export async function merge(pullRequest: Readonly<Pick<PullRequest, 'id'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    // 检查 PR 是否存在
    const {id} = pullRequest;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName,
        title, status, no,
    } = pullRequests[0];
    // 检查是不是开启状态
    if (status !== PULL_REQUEST_STATUS.OPEN)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `Pull Request #${no} 已关闭`));
    }
    // 检查是不是合作者操作
    // 仓库一定存在
    const collaborates = await CollaborateTable.select({
        repositoryUsername: targetRepositoryUsername,
        repositoryName: targetRepositoryName,
    });
    const collaborators = collaborates.map(({username}) => username);
    if (usernameInSession === undefined
        || (usernameInSession !== targetRepositoryUsername
            && !collaborators.includes(usernameInSession)))
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `只有目标仓库 ${targetRepositoryUsername}/${targetRepositoryName} 的合作者可合并 Pull Request #${no}`));
    }
    // 检查分支是否存在
    const sourceRepositoryPath = generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranchName),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranchName),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranchName} 不存在`));
    }
    else if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false,
                `${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranchName} 不存在`));
    }

    // 检查是否可合并
    const isMergeable = await Git.isMergeable(
        sourceRepositoryPath, sourceRepositoryBranchName,
        targetRepositoryPath, targetRepositoryBranchName,
    );
    if (!isMergeable)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `Pull Request #${no} 存在冲突，请解决冲突后再合并`));
    }
    // 获取目标仓库所有者信息，用于Merge的提交
    const {email: targetRepositoryUserEmail} = (await ProfileTable.selectByUsername(targetRepositoryUsername))!;   // 用户是一定存在的

    // 进行合并操作
    await Git.merge(
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName, targetRepositoryUserEmail,
        `合并 Pull Request #${no}\n\n${title}`,
    );
    // merge 成功再改动数据库
    await PullRequestTable.update(
        {status: PULL_REQUEST_STATUS.MERGED},
        {id});
    // 更新关联分支的 pr 信息
    await updateRelatedPullRequest({username: targetRepositoryUsername, name: targetRepositoryName});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function get(repository: Readonly<Pick<Repository, 'username' | 'name'>>, pullRequest: Readonly<Pick<PullRequest, 'no'>>, usernameInSession: ILoggedInSession['username'] | undefined): Promise<ServiceResponse<PullRequest | null>>
{
    // 获取 PR 数据库信息
    const {username, name} = repository;
    const {no} = pullRequest;
    const pullRequests = await PullRequestTable.select({
        no,
        targetRepositoryUsername: username,
        targetRepositoryName: name,
    });
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<null>(404, {},
            new ResponseBody(true, '', null));
    }
    // 访问权限查看
    const repositories = await RepositoryTable.select({username, name});
    if (!await hasReadAuthority(
        repositories[0],    // 一定存在
        {username: usernameInSession}))
    {
        return new ServiceResponse<null>(404, {},
            new ResponseBody(true, '', null));
    }
    // 返回 PR
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', pullRequests[0]));
}

export async function getByRepository(repository: Pick<Repository, 'username' | 'name'>, status: PULL_REQUEST_STATUS | undefined, offset: number, limit: number, usernameInSession: ILoggedInSession['username'] | undefined): Promise<ServiceResponse<{ pullRequests: PullRequest[] } | void>>
{
    // 获取仓库数据库信息
    const {username, name} = repository;
    const repositories = await RepositoryTable.select({username, name});
    if (repositories.length === 0)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    // 查看访问权限
    if (!await hasReadAuthority(repositories[0], {username: usernameInSession}))
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    // 获取 PR 列表
    const pullRequests = await PullRequestTable.select({
        targetRepositoryUsername: username,
        targetRepositoryName: name,
        status,
    }, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {pullRequests}));
}

export async function getPullRequestAmount(repository: Readonly<Pick<Repository, 'username' | 'name'>>, status: PULL_REQUEST_STATUS | undefined, usernameInSession: ILoggedInSession['username'] | undefined): Promise<ServiceResponse<{ amount: number } | void>>
{
    const {username, name} = repository;
    const repositories = await RepositoryTable.select({username, name});
    if (repositories.length === 0)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    if (!await hasReadAuthority(repositories[0], {username: usernameInSession}))
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const amount = await PullRequestTable.count({
        targetRepositoryUsername: username,
        targetRepositoryName: name,
        status,
    });
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}

export async function addComment(pullRequestComment: Readonly<Omit<PullRequestComment, 'id' | 'username' | 'creationTime' | 'modificationTime'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    // 查看 PR 是否存在
    const {belongsTo, content} = pullRequestComment;
    const pullRequests = await PullRequestTable.select({id: belongsTo});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    const {targetRepositoryUsername, targetRepositoryName, status, no} = pullRequests[0];
    // 查看是不是开启状态
    if (status !== PULL_REQUEST_STATUS.OPEN)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `Pull Request #${no} 已关闭`));
    }
    // 查看提交者是否有权限
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await hasReadAuthority(
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

export async function updateComment(primaryKey: Readonly<Pick<PullRequestComment, 'id'>>, pullRequestComment: Readonly<Pick<PullRequestComment, 'content'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
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

export async function getComments(repository: Readonly<Pick<Repository, 'username' | 'name'>>, pullRequest: Readonly<Pick<PullRequest, 'no'>>, offset: number, limit: number, usernameInSession: ILoggedInSession['username'] | undefined): Promise<ServiceResponse<{ comments: PullRequestComment[] } | void>>
{
    // 获取 PR 数据库信息
    const {username, name} = repository;
    const {no} = pullRequest;
    const pullRequests = await PullRequestTable.select({
        targetRepositoryUsername: username,
        targetRepositoryName: name,
        no,
    });
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 查看访问权限
    const {targetRepositoryUsername, targetRepositoryName, id} = pullRequests[0];
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await hasReadAuthority(
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
    }, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {comments: pullRequestComments}));
}

export async function getConflicts(pullRequest: Readonly<Pick<PullRequest, 'id'>>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ conflicts: Conflict[] } | void>>
{
    // 获取 PR 数据库信息
    const {id} = pullRequest;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName,
        status, no,
    } = pullRequests[0];
    // 查看是不是开启状态
    if (status !== PULL_REQUEST_STATUS.OPEN)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `Pull Request #${no} 已关闭`));
    }
    // 查看访问权限
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await hasReadAuthority(
        repositories[0],    // 一定存在
        {username: usernameInSession},
    ))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 获取冲突信息
    const conflicts = await Git.getConflicts(
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {conflicts}));
}

export async function resolveConflicts(pullRequest: Readonly<Pick<PullRequest, 'id'>>, conflicts: Readonly<Conflict[]>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    // 获取 PR 数据库信息
    const {id} = pullRequest;
    const pullRequests = await PullRequestTable.select({id});
    if (pullRequests.length === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }

    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName, no, status,
    } = pullRequests[0];
    // 查看是不是开启状态
    if (status !== PULL_REQUEST_STATUS.OPEN)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `Pull Request #${no} 已关闭`));
    }
    // 查看访问权限
    if (sourceRepositoryUsername !== usernameInSession)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, `只有 Pull Request #${no} 的创建者可解决冲突`));
    }
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await hasReadAuthority(
        repositories[0],    // 一定存在
        {username: usernameInSession},
    ))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    // 检查有没有二进制文件
    for (const {isBinary} of conflicts)
    {
        if (isBinary)
        {
            return new ServiceResponse<void>(200, {},
                new ResponseBody(false, '存在二进制文件冲突，请使用命令行解决'));
        }
    }
    // 获取源仓库所有者信息，用于冲突解决的提交
    const {email: sourceRepositoryUserEmail} = (await ProfileTable.selectByUsername(sourceRepositoryUsername))!;   // 用户是一定存在的
    // 进行冲突解决
    await Git.resolveConflicts(sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryBranchName, sourceRepositoryUserEmail,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryBranchName,
        conflicts, {no});
    await updateRelatedPullRequest({username: sourceRepositoryUsername, name: sourceRepositoryName});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}

export async function getCommits(pullRequest: Readonly<Pick<PullRequest, 'id'>>, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commits: Commit[] } | void>>
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
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryCommitHash,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryCommitHash,
    } = pullRequests[0];
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await hasReadAuthority(
        repositories[0],    // 一定存在
        {username: usernameInSession},
    ))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    const sourceRepositoryPath = generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    // 获取提交历史
    const commits = await Git.getCommitsBetweenRepositoriesCommits(
        targetRepositoryPath, targetRepositoryCommitHash,
        sourceRepositoryPath, sourceRepositoryCommitHash,
        offset, limit,
    );
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commits}));
}

export async function getCommitAmount(pullRequest: Readonly<Pick<PullRequest, 'id'>>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commitAmount: number } | void>>
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
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryCommitHash,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryCommitHash,
    } = pullRequests[0];
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await hasReadAuthority(
        repositories[0],    // 一定存在
        {username: usernameInSession},
    ))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    const sourceRepositoryPath = generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    // 获取提交历史
    const commitAmount = await Git.getCommitCountBetweenRepositoriesCommits(
        targetRepositoryPath, targetRepositoryCommitHash,
        sourceRepositoryPath, sourceRepositoryCommitHash,
    );
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commitAmount}));
}

export async function getFileDiffs(pullRequest: Readonly<Pick<PullRequest, 'id'>>, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ fileDiffs: FileDiff[] } | void>>
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
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryCommitHash,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryCommitHash,
    } = pullRequests[0];
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await hasReadAuthority(
        repositories[0],    // 一定存在
        {username: usernameInSession},
    ))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    const sourceRepositoryPath = generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    // 获取提交历史
    const fileDiffs = await Git.getFileDiffsBetweenRepositoriesCommits(
        targetRepositoryPath, targetRepositoryCommitHash,
        sourceRepositoryPath, sourceRepositoryCommitHash,
        offset, limit,
    );
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {fileDiffs}));
}

export async function getFileDiffAmount(pullRequest: Readonly<Pick<PullRequest, 'id'>>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ amount: number } | void>>
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
    const {
        sourceRepositoryUsername, sourceRepositoryName, sourceRepositoryCommitHash,
        targetRepositoryUsername, targetRepositoryName, targetRepositoryCommitHash,
    } = pullRequests[0];
    const repositories = await RepositoryTable.select({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    if (!await hasReadAuthority(
        repositories[0],    // 一定存在
        {username: usernameInSession},
    ))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, 'Pull Request 不存在'));
    }
    const sourceRepositoryPath = generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });

    const changedFiles = await getChangedFilesBetweenRepositoriesCommits(
        targetRepositoryPath, targetRepositoryCommitHash,
        sourceRepositoryPath, sourceRepositoryCommitHash);
    const amount = changedFiles.length;
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}