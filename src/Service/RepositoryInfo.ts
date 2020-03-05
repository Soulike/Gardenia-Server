import {Session} from 'koa-session';
import {Account, Branch, Commit, FileDiff, Group, Repository, ResponseBody, ServiceResponse} from '../Class';
import {Fork as ForkTable, Group as GroupTable, Repository as RepositoryTable} from '../Database';
import {Repository as RepositoryFunction} from '../Function';
import {SERVER} from '../CONFIG';
import {ObjectType} from '../CONSTANT';
import mime from 'mime-types';
import fse from 'fs-extra';
import {Readable} from 'stream';
import {
    fileExists,
    getBranches,
    getBranchNames,
    getChangedFilesBetweenCommits,
    getCommit,
    getCommitCount,
    getCommitCountBetweenCommits,
    getCommitCountBetweenRepositoriesCommits,
    getCommitFileDiffs,
    getCommitsBetweenForks,
    getFileCommits,
    getFileCommitsBetweenCommits,
    getFileDiff,
    getFileDiffInfoBetweenCommits,
    getFileDiffsBetweenForks,
    getFileLastCommit,
    getFileObjectHash,
    getFileObjectType,
    getFileReadStream,
    getFileSize,
    getLastCommit,
    getPathInfo,
    getRepositoryCommits,
    getRepositoryCommitsBetweenCommits,
    hasBranch,
    isBinaryFile,
} from '../Git';

export async function repository(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, session: Readonly<Session>): Promise<ServiceResponse<Repository | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    return new ServiceResponse<Repository>(200, {},
        new ResponseBody<Repository>(true, '', repositoryInDatabase!));
}

export async function branches(repository: Readonly<Pick<Repository, 'username' | 'name'>>, usernameInSession?: Account['username']): Promise<ServiceResponse<{ branches: Branch[] } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const branches = await getBranches(repositoryPath);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {branches}));
}

export async function branchNames(repository: Readonly<Pick<Repository, 'username' | 'name'>>, usernameInSession?: Account['username']): Promise<ServiceResponse<{ branchNames: string[] } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const branchNames = await getBranchNames(repositoryPath);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {branchNames}));
}

export async function lastCommit(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, commitHash: string, session: Readonly<Session>, filePath?: string): Promise<ServiceResponse<Commit | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        if (filePath !== undefined)
        {
            if (await fileExists(repositoryPath, filePath, commitHash))
            {
                const commit = await getFileLastCommit(repositoryPath, commitHash, filePath);
                return new ServiceResponse<Commit>(200, {},
                    new ResponseBody<Commit>(true, '', commit));
            }
            else
            {
                return new ServiceResponse<Commit>(404, {},
                    new ResponseBody<Commit>(false, '文件不存在'));
            }
        }
        else
        {
            const commit = await getLastCommit(repositoryPath, commitHash);
            return new ServiceResponse<Commit>(200, {},
                new ResponseBody<Commit>(true, '', commit));
        }

    }
    catch (e)
    {
        SERVER.WARN_LOGGER(e);
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支或文件不存在'));
    }
}

export async function directory(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, commitHash: string, directoryPath: string, session: Readonly<Session>): Promise<ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }> | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        const fileCommitInfoList = await getPathInfo(repositoryPath, commitHash, directoryPath);

        // 对获取的数组进行排序，类型为 TREE 的在前，BLOB 的在后
        fileCommitInfoList.sort((a, b) =>
        {
            if (a.type === ObjectType.TREE && b.type === ObjectType.BLOB)
            {
                return -1;
            }
            else if (a.type === ObjectType.BLOB && b.type === ObjectType.TREE)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        });

        return new ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }>>(
            200,
            {},
            new ResponseBody<Array<{ type: ObjectType, path: string, commit: Commit }>>(
                true,
                '',
                fileCommitInfoList,
            ),
        );
    }
    catch (e)
    {
        SERVER.WARN_LOGGER(e);
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '文件不存在'));
    }
}

export async function commitCount(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, commitHash: string, session: Readonly<Session>): Promise<ServiceResponse<{ commitCount: number } | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        const commitCount = await getCommitCount(repositoryPath, commitHash);
        return new ServiceResponse<{ commitCount: number }>(200, {},
            new ResponseBody<{ commitCount: number }>(true, '', {commitCount}));
    }
    catch (e)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支或提交不存在'));
    }
}

export async function commitCountBetweenCommits(repository: Readonly<Pick<Repository, 'username' | 'name'>>, baseCommitHash: string, targetCommitHash: string, usernameInSession?: Account['username']): Promise<ServiceResponse<{ commitCount: number } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        const commitCount = await getCommitCountBetweenCommits(repositoryPath, baseCommitHash, targetCommitHash);
        return new ServiceResponse<{ commitCount: number }>(200, {},
            new ResponseBody<{ commitCount: number }>(true, '', {commitCount}));
    }
    catch (e)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支或提交不存在'));
    }
}

export async function fileInfo(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, filePath: string, commitHash: string, session: Readonly<Session>): Promise<ServiceResponse<{ exists: boolean, type?: ObjectType, size?: number, isBinary?: boolean } | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        if (!(await fileExists(repositoryPath, filePath, commitHash)))
        {
            return new ServiceResponse(200, {},
                new ResponseBody(true, '', {exists: false}));
        }
    }
    catch (e)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, '分支或提交不存在'));
    }

    const [objectHash, objectType] = await Promise.all<string, ObjectType>([
        getFileObjectHash(repositoryPath, filePath, commitHash),
        getFileObjectType(repositoryPath, filePath, commitHash),
    ]);
    if (!(await isBinaryFile(repositoryPath, objectHash)))
    {
        const size = await getFileSize(repositoryPath, objectHash);
        return new ServiceResponse(200, {},
            new ResponseBody(
                true, '', {
                    exists: true, isBinary: false, type: objectType, size,
                },
            ));
    }
    else    // 是二进制文件
    {
        return new ServiceResponse(200, {},
            new ResponseBody(
                true, '', {
                    exists: true, isBinary: true,
                },
            ));
    }
}

export async function rawFile(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, filePath: string, commitHash: string, session: Readonly<Session>): Promise<ServiceResponse<Readable | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {});
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        if (await fileExists(repositoryPath, filePath, commitHash))
        {
            // 获取对象哈希
            const objectHash = await getFileObjectHash(repositoryPath, filePath, commitHash);
            return new ServiceResponse<Readable>(200,
                {'Content-Type': mime.contentType(filePath) || 'application/octet-stream'},
                getFileReadStream(repositoryPath, objectHash));
        }
        else
        {
            return new ServiceResponse<void>(404, {});
        }
    }
    catch (e)
    {
        return new ServiceResponse<void>(404, {});
    }
}

export async function setName(repository: Readonly<Pick<Repository, 'name'>>, newRepository: Readonly<Pick<Repository, 'name'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {name: repositoryName} = repository;
    const {name: newRepositoryName} = newRepository;
    const {username} = session;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name: repositoryName});
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    if ((await RepositoryTable.selectByUsernameAndName({username, name: newRepositoryName})) !== null)
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '仓库名已存在'));
    }

    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name: repositoryName});
    const newRepoPath = RepositoryFunction.generateRepositoryPath({username, name: newRepositoryName});
    try
    {
        await fse.copy(repositoryPath, newRepoPath, {
            overwrite: false,
            errorOnExist: true,
            preserveTimestamps: true,
        });
        const {username} = repositoryInDatabase!;
        await RepositoryTable.update({name: newRepositoryName}, {username, name: repositoryName});
    }
    catch (e)
    {
        await fse.remove(newRepoPath);
        throw e;
    }
    await fse.remove(repositoryPath);
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function setDescription(repository: Readonly<Pick<Repository, 'name' | 'description'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {username} = session;
    const {name: repositoryName, description} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name: repositoryName});
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    await RepositoryTable.update({description}, {username, name: repositoryName});
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function setIsPublic(repository: Readonly<Pick<Repository, 'name' | 'isPublic'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {name, isPublic} = repository;
    const {username} = session;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    await RepositoryTable.update({isPublic}, {username, name});
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function groups(repository: Readonly<Pick<Repository, 'username' | 'name'>>, session: Readonly<Session>): Promise<ServiceResponse<Group[]>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, '仓库不存在'));
    }
    const groups = await RepositoryTable.getGroupsByUsernameAndName(repository);
    return new ServiceResponse<Group[]>(200, {},
        new ResponseBody<Group[]>(true, '', groups));
}

export async function addToGroup(repository: Readonly<Pick<Repository, 'username' | 'name'>>, group: Readonly<Pick<Group, 'id'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {username: repositoryUsername} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    const {username: usernameInSession} = session;
    if (!await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const {id: groupId} = group;
    const groupInDatabase = await GroupTable.selectById(groupId);
    if (groupInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '小组不存在'));
    }
    if ((await RepositoryTable.getGroupByUsernameAndNameAndGroupId(repository, group)) !== null)
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '仓库已在小组中'));
    }
    const {username: sessionUsername} = session!;
    if (sessionUsername !== repositoryUsername)
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '添加失败：您不是仓库的所有者'));
    }
    const accountsInGroup = await GroupTable.getAccountsById(groupId);
    if (!accountsInGroup.map(account => account.username).includes(sessionUsername))
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '添加失败：您不是小组的成员'));
    }
    await GroupTable.addRepositories(groupId, [repository]);
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function commitHistoryBetweenCommits(repository: Pick<Repository, 'username' | 'name'>, baseCommitHash: string, targetCommitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER, usernameInSession?: Account['username']): Promise<ServiceResponse<{ commits: Commit[], } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const commits = await getRepositoryCommitsBetweenCommits(repositoryPath, baseCommitHash, targetCommitHash, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commits}));
}

export async function commitHistory(repository: Pick<Repository, 'username' | 'name'>, targetCommitHash: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER, usernameInSession?: Account['username']): Promise<ServiceResponse<{ commits: Commit[], } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const commits = await getRepositoryCommits(repositoryPath, targetCommitHash, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commits}));
}

export async function fileCommitHistoryBetweenCommits(repository: Pick<Repository, 'username' | 'name'>, filePath: string, baseCommitHash: string, targetCommitHash: string, usernameInSession?: Account['username']): Promise<ServiceResponse<{ commits: Commit[], } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const commits = await getFileCommitsBetweenCommits(repositoryPath, filePath, baseCommitHash, targetCommitHash);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commits}));
}

export async function fileCommitHistory(repository: Pick<Repository, 'username' | 'name'>, filePath: string, targetCommitHash: string, usernameInSession?: Account['username']): Promise<ServiceResponse<{ commits: Commit[], } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const commits = await getFileCommits(repositoryPath, filePath, targetCommitHash);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commits}));
}

export async function diffBetweenCommits(repository: Pick<Repository, 'username' | 'name'>, baseCommitHash: string, targetCommitHash: string, usernameInSession?: Account['username']): Promise<ServiceResponse<{ diff: FileDiff[] } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const diffFiles = await getChangedFilesBetweenCommits(repositoryPath, baseCommitHash, targetCommitHash);
    const fileDiffs = await Promise.all(diffFiles.map(
        async filePath =>
            await getFileDiffInfoBetweenCommits(repositoryPath, filePath, baseCommitHash, targetCommitHash)),
    );
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {diff: fileDiffs}));
}

export async function fileDiffBetweenCommits(repository: Pick<Repository, 'username' | 'name'>, filePath: string, baseCommitHash: string, targetCommitHash: string, usernameInSession?: Account['username']): Promise<ServiceResponse<{ diff: FileDiff } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const diff = await getFileDiffInfoBetweenCommits(repositoryPath, filePath, baseCommitHash, targetCommitHash);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {diff}));
}

export async function commit(repository: Pick<Repository, 'username' | 'name'>, commitHash: string, usernameInSession?: Account['username']): Promise<ServiceResponse<{ commit: Commit, diff: FileDiff[] } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const [commit, diff] = await Promise.all([
        getCommit(repositoryPath, commitHash),
        getCommitFileDiffs(repositoryPath, commitHash),
    ]);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commit, diff}));
}

export async function fileCommit(repository: Pick<Repository, 'username' | 'name'>, filePath: string, commitHash: string, usernameInSession?: Account['username']): Promise<ServiceResponse<{ commit: Commit, diff: FileDiff } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const [commit, diff] = await Promise.all([
        getCommit(repositoryPath, commitHash),
        getFileDiff(repositoryPath, filePath, commitHash),
    ]);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commit, diff}));
}

export async function forkAmount(repository: Pick<Repository, 'username' | 'name'>, usernameInSession?: Account['username']): Promise<ServiceResponse<{ amount: number } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const {username, name} = repository;
    const amount = await ForkTable.count({
        sourceRepositoryUsername: username,
        sourceRepositoryName: name,
    });
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}

export async function forkRepositories(repository: Pick<Repository, 'username' | 'name'>, usernameInSession?: Account['username']): Promise<ServiceResponse<{ repositories: Repository[] } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const {username, name} = repository;
    const repositoryPks = await ForkTable.select({
        sourceRepositoryUsername: username,
        sourceRepositoryName: name,
    });
    const repositoriesWithNull = await Promise.all(repositoryPks.map(
        async ({targetRepositoryUsername: username, targetRepositoryName: name}) =>
            (await RepositoryTable.selectByUsernameAndName({username, name}))));
    const repositories: Repository[] = [];
    for (const repository of repositoriesWithNull)
    {
        if (repository !== null)
        {
            repositories.push(repository);
        }
    }
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {repositories}));
}

export async function forkFrom(repository: Pick<Repository, 'username' | 'name'>, usernameInSession?: Account['username']): Promise<ServiceResponse<{ repository: Pick<Repository, 'username' | 'name'> | null } | void>>
{
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    if (repositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '仓库不存在'));
    }
    const {username, name} = repository;
    const repositoryRepositories = await ForkTable.select({
        targetRepositoryUsername: username,
        targetRepositoryName: name,
    });
    if (repositoryRepositories.length === 0)
    {
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {repository: null}));
    }
    else
    {
        const {sourceRepositoryName, sourceRepositoryUsername} = repositoryRepositories[0];
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {
                repository: {
                    username: sourceRepositoryUsername, name: sourceRepositoryName,
                },
            }));
    }
}

export async function forkCommitHistory(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>, sourceRepositoryBranch: string, targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>, targetRepositoryBranch: string, usernameInSession?: string): Promise<ServiceResponse<{ commits: Commit[] } | void>>
{
    const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
    const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
    // 检查仓库存在性和可访问性
    const [sourceRepositoryInDatabase, targetRepositoryInDatabase] = await Promise.all([
        RepositoryTable.selectByUsernameAndName({username: sourceRepositoryUsername, name: sourceRepositoryName}),
        RepositoryTable.selectByUsernameAndName({username: targetRepositoryUsername, name: targetRepositoryName}),
    ]);
    if (sourceRepositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(sourceRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 不存在`));
    }
    if (targetRepositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(targetRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 不存在`));
    }
    // 检查分支存在性
    const sourceRepositoryPath = RepositoryFunction.generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = RepositoryFunction.generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        hasBranch(targetRepositoryPath, targetRepositoryBranch),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranch} 不存在`));
    }
    if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranch} 不存在`));
    }
    // 获取提交历史
    const commits = await getCommitsBetweenForks(targetRepositoryPath, targetRepositoryBranch, sourceRepositoryPath, sourceRepositoryBranch);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commits}));
}

export async function forkCommitAmount(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>, sourceRepositoryBranch: string, targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>, targetRepositoryBranch: string, usernameInSession?: string): Promise<ServiceResponse<{ commitAmount: number } | void>>
{
    const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
    const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
    // 检查仓库存在性和可访问性
    const [sourceRepositoryInDatabase, targetRepositoryInDatabase] = await Promise.all([
        RepositoryTable.selectByUsernameAndName({username: sourceRepositoryUsername, name: sourceRepositoryName}),
        RepositoryTable.selectByUsernameAndName({username: targetRepositoryUsername, name: targetRepositoryName}),
    ]);
    if (sourceRepositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(sourceRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 不存在`));
    }
    if (targetRepositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(targetRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 不存在`));
    }
    // 检查分支存在性
    const sourceRepositoryPath = RepositoryFunction.generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = RepositoryFunction.generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        hasBranch(targetRepositoryPath, targetRepositoryBranch),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranch} 不存在`));
    }
    if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranch} 不存在`));
    }
    // 获取提交次数
    const commitAmount = await getCommitCountBetweenRepositoriesCommits(targetRepositoryPath, targetRepositoryBranch, sourceRepositoryPath, sourceRepositoryBranch);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commitAmount}));
}

export async function forkFileDiff(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>, sourceRepositoryBranch: string, targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>, targetRepositoryBranch: string, usernameInSession?: string): Promise<ServiceResponse<{ fileDiffs: FileDiff[] } | void>>
{
    const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
    const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
    // 检查仓库存在性和可访问性
    const [sourceRepositoryInDatabase, targetRepositoryInDatabase] = await Promise.all([
        RepositoryTable.selectByUsernameAndName({username: sourceRepositoryUsername, name: sourceRepositoryName}),
        RepositoryTable.selectByUsernameAndName({username: targetRepositoryUsername, name: targetRepositoryName}),
    ]);
    if (sourceRepositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(sourceRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 不存在`));
    }
    if (targetRepositoryInDatabase === null || !await RepositoryFunction.repositoryIsAvailableToTheViewer(targetRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 不存在`));
    }
    // 检查分支存在性
    const sourceRepositoryPath = RepositoryFunction.generateRepositoryPath({
        username: sourceRepositoryUsername,
        name: sourceRepositoryName,
    });
    const targetRepositoryPath = RepositoryFunction.generateRepositoryPath({
        username: targetRepositoryUsername,
        name: targetRepositoryName,
    });
    const [sourceRepositoryHasBranch, targetRepositoryHasBranch] = await Promise.all([
        hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        hasBranch(targetRepositoryPath, targetRepositoryBranch),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranch} 不存在`));
    }
    if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranch} 不存在`));
    }
    // 获取文件差异
    const fileDiffs = await getFileDiffsBetweenForks(targetRepositoryPath, targetRepositoryBranch, sourceRepositoryPath, sourceRepositoryBranch);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {fileDiffs}));
}