import {Session} from 'koa-session';
import {Account, Commit, Group, Repository as RepositoryClass, ResponseBody, ServiceResponse} from '../Class';
import {Group as GroupTable, Repository as RepositoryTable} from '../Database';
import {Git, Repository} from '../Function';
import {SERVER} from '../CONFIG';
import {ObjectType} from '../CONSTANT';
import mime from 'mime-types';
import fse from 'fs-extra';

export async function repository(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<RepositoryClass, 'name'>>, session: Readonly<Session>): Promise<ServiceResponse<RepositoryClass | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    return new ServiceResponse<RepositoryClass>(200, {},
        new ResponseBody<RepositoryClass>(true, '', repositoryInDatabase!));
}

export async function branch(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<RepositoryClass, 'name'>>, session: Readonly<Session>): Promise<ServiceResponse<Array<string> | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = Git.generateRepositoryPath({username, name});
    const branches = await Git.getAllBranches(repositoryPath);
    return new ServiceResponse<Array<string>>(200, {},
        new ResponseBody<Array<string>>(true, '', Git.putMasterBranchToFront(branches, 'master')));
}

export async function lastCommit(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<RepositoryClass, 'name'>>, commitHash: string, session: Readonly<Session>, filePath?: string): Promise<ServiceResponse<Commit | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = Git.generateRepositoryPath({username, name});
    try
    {
        const commit = await Git.getLastCommitInfo(repositoryPath, commitHash, filePath);
        return new ServiceResponse<Commit>(200, {},
            new ResponseBody<Commit>(true, '', commit));
    }
    catch (e)
    {
        SERVER.WARN_LOGGER(e);
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支或文件不存在'));
    }
}

export async function directory(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<RepositoryClass, 'name'>>, commitHash: string, directoryPath: string, session: Readonly<Session>): Promise<ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }> | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = Git.generateRepositoryPath({username, name});
    try
    {
        const fileCommitInfoList = await Git.getFileCommitInfoList(repositoryPath, commitHash, directoryPath);

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

export async function commitCount(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<RepositoryClass, 'name'>>, commitHash: string, session: Readonly<Session>): Promise<ServiceResponse<{ commitCount: number } | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = Git.generateRepositoryPath({username, name});
    try
    {
        const commitCount = await Git.getCommitCount(repositoryPath, commitHash);
        return new ServiceResponse<{ commitCount: number }>(200, {},
            new ResponseBody<{ commitCount: number }>(true, '', {commitCount}));
    }
    catch (e)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支或提交不存在'));
    }
}

export async function fileInfo(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<RepositoryClass, 'name'>>, filePath: string, commitHash: string, session: Readonly<Session>): Promise<ServiceResponse<{ exists: boolean, type?: ObjectType, size?: number, isBinary?: boolean } | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    const repositoryPath = Git.generateRepositoryPath({username, name});
    try
    {
        if (!(await Git.objectExists(repositoryPath, filePath, commitHash)))
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

    const [objectHash, objectType] = await Promise.all([
        Git.getObjectHash(repositoryPath, filePath, commitHash),
        Git.getObjectType(repositoryPath, filePath, commitHash),
    ]);

    if (!(await Git.isBinaryObject(repositoryPath, objectHash)))
    {
        const size = await Git.getObjectSize(repositoryPath, objectHash);
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

export async function rawFile(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<RepositoryClass, 'name'>>, filePath: string, commitHash: string, session: Readonly<Session>): Promise<ServiceResponse>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {});
    }
    const repositoryPath = Git.generateRepositoryPath({username, name});
    try
    {
        if (await Git.objectExists(repositoryPath, filePath, commitHash))
        {
            // 获取对象哈希
            const objectHash = await Git.getObjectHash(repositoryPath, filePath, commitHash);
            return new ServiceResponse<void>(200,
                {'Content-Type': mime.contentType(filePath) || 'application/octet-stream'},
                Git.getObjectReadStream(repositoryPath, objectHash));
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

export async function setName(repository: Readonly<Pick<RepositoryClass, 'name'>>, newRepository: Readonly<Pick<RepositoryClass, 'name'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {name: repositoryName} = repository;
    const {name: newRepositoryName} = newRepository;
    const {username} = session;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name: repositoryName});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    if ((await RepositoryTable.selectByUsernameAndName({username, name: newRepositoryName})) !== null)
    {
        return new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '仓库名已存在'));
    }

    const repositoryPath = Git.generateRepositoryPath({username, name: repositoryName});
    const newRepoPath = Git.generateRepositoryPath({username, name: newRepositoryName});
    try
    {
        await fse.copy(repositoryPath, newRepoPath, {
            overwrite: false,
            errorOnExist: true,
            preserveTimestamps: true,
        });
    }
    catch (e)
    {
        await fse.remove(newRepoPath);
        throw e;
    }

    try
    {
        const {username, name} = repositoryInDatabase!;
        repositoryInDatabase!.name = newRepositoryName;
        await RepositoryTable.update(repositoryInDatabase!, {username, name});
    }
    catch (e)
    {
        await fse.remove(newRepoPath);
        throw e;
    }
    await fse.remove(repositoryPath);
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function setDescription(repository: Readonly<Pick<RepositoryClass, 'name' | 'description'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {username} = session;
    const {name: repositoryName, description} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name: repositoryName});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    repositoryInDatabase!.description = description;
    await RepositoryTable.update(repositoryInDatabase!, {username, name: repositoryName});
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function setIsPublic(repository: Readonly<Pick<RepositoryClass, 'name' | 'isPublic'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {name, isPublic} = repository;
    const {username} = session;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在'));
    }
    repositoryInDatabase!.isPublic = isPublic;
    await RepositoryTable.update(repositoryInDatabase!, {username, name});
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function groups(repository: Readonly<Pick<RepositoryClass, 'username' | 'name'>>, session: Readonly<Session>): Promise<ServiceResponse<Group[]>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, '仓库不存在'));
    }
    const groups = await RepositoryTable.getGroupsByUsernameAndName(repository);
    return new ServiceResponse<Group[]>(200, {},
        new ResponseBody<Group[]>(true, '', groups));
}

export async function addToGroup(repository: Readonly<Pick<RepositoryClass, 'username' | 'name'>>, group: Readonly<Pick<Group, 'id'>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {username: repositoryUsername} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName(repository);
    const {username: usernameInSession} = session;
    if (!Repository.repositoryIsAvailableToTheViewer(repositoryInDatabase, {username: usernameInSession}))
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