import {Account, Branch, Commit, FileDiff, Repository, ResponseBody, ServiceResponse, Tag} from '../Class';
import {Fork as ForkTable, Repository as RepositoryTable, Star as StarTable} from '../Database';
import {Repository as RepositoryFunction} from '../Function';
import {SERVER} from '../CONFIG';
import {ObjectType} from '../CONSTANT';
import mime from 'mime-types';
import fse from 'fs-extra';
import {Readable} from 'stream';
import * as Git from '../Git';
import path from 'path';
import {ILoggedInSession, ISession} from '../Interface';
import {hasReadAuthority} from '../RepositoryAuthorityCheck';

export async function repository(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, usernameInSession: ISession['username']): Promise<ServiceResponse<Repository | null>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<null>(404, {},
            new ResponseBody(true, '', null));
    }
    return new ServiceResponse<Repository>(200, {},
        new ResponseBody<Repository>(true, '', repositoryInDatabase!));
}

export async function branches(repository: Readonly<Pick<Repository, 'username' | 'name'>>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ branches: Branch[] } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const branches = await Git.getBranches(repositoryPath);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {branches}));
}

export async function branchNames(repository: Readonly<Pick<Repository, 'username' | 'name'>>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ branchNames: string[] } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const branchNames = await Git.getBranchNames(repositoryPath);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {branchNames}));
}

export async function tagNames(repository: Readonly<Pick<Repository, 'username' | 'name'>>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ tagNames: string[] } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const tagNames = await Git.getTagNames(repositoryPath);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {tagNames}));
}

export async function tags(repository: Readonly<Pick<Repository, 'username' | 'name'>>, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ tags: Tag[] } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    const tags = await Git.getTagsInfo(repositoryPath, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {tags}));
}

export async function tag(repository: Readonly<Pick<Repository, 'username' | 'name'>>, tagName: string, usernameInSession: ISession['username']): Promise<ServiceResponse<Tag | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const tag = await Git.getTagInfo(repositoryPath, tagName);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', tag));
    }
    catch (e)
    {
        SERVER.WARN_LOGGER(e);
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `标签 ${tagName} 不存在`));
    }
}

export async function lastBranchCommit(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, branch: string, filePath: string | undefined, usernameInSession: ISession['username']): Promise<ServiceResponse<Commit | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        if (filePath !== undefined)
        {
            if (await Git.fileExists(repositoryPath, filePath, branch))
            {
                const commit = await Git.getFileLastCommit(repositoryPath, branch, filePath);
                return new ServiceResponse<Commit>(200, {},
                    new ResponseBody<Commit>(true, '', commit));
            }
            else
            {
                return new ServiceResponse<Commit>(404, {},
                    new ResponseBody<Commit>(false, '分支或文件不存在'));
            }
        }
        else
        {
            const commit = await Git.getBranchLastCommit(repositoryPath, branch);
            return new ServiceResponse<Commit>(200, {},
                new ResponseBody<Commit>(true, '', commit));
        }

    }
    catch (e)
    {
        SERVER.WARN_LOGGER(e);
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `分支 ${branch} 不存在`));
    }
}

export async function lastCommit(repository: Readonly<Pick<Repository, 'username' | 'name'>>, usernameInSession: ISession['username']): Promise<ServiceResponse<Commit | null | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        const commit = await Git.getLastCommit(repositoryPath);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', commit));
    }
    catch (e)
    {
        return new ServiceResponse<null>(200, {},
            new ResponseBody(true, '', null));
    }
}

export async function directory(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, commitHash: string, directoryPath: string, usernameInSession: ISession['username']): Promise<ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }> | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        const fileCommitInfoList = await Git.getPathInfo(repositoryPath, commitHash, directoryPath);
        // 对获取的数组进行排序，类型为 TREE 的在前，BLOB 的在后，之后进行姓名排序
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
            else if (a.path < b.path)
            {
                return -1;
            }
            else if (a.path > b.path)
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
            new ResponseBody<void>(false, '文件或目录不存在'));
    }
}

export async function commitCount(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, commitHash: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commitCount: number } | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
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

export async function commitCountBetweenCommits(repository: Readonly<Pick<Repository, 'username' | 'name'>>, baseCommitHash: string, targetCommitHash: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commitCount: number } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        const commitCount = await Git.getCommitCountBetweenCommits(repositoryPath, baseCommitHash, targetCommitHash);
        return new ServiceResponse<{ commitCount: number }>(200, {},
            new ResponseBody<{ commitCount: number }>(true, '', {commitCount}));
    }
    catch (e)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支或提交不存在'));
    }
}

export async function fileInfo(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, filePath: string, commitHash: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ objectType: ObjectType | null, fileType: string | null, fileSize: number | null } | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        if (!(await Git.fileExists(repositoryPath, filePath, commitHash)))
        {
            return new ServiceResponse<{ objectType: ObjectType | null; fileType: string | null; fileSize: number | null } | void>(
                200, {},
                new ResponseBody(true, '', {objectType: null, fileType: null, fileSize: null}));
        }
    }
    catch (e)
    {
        return new ServiceResponse(404, {},
            new ResponseBody(false, '分支、提交或文件不存在'));
    }

    const [objectHash, objectType] = await Promise.all([
        Git.getFileObjectHash(repositoryPath, filePath, commitHash),
        Git.getFileObjectType(repositoryPath, filePath, commitHash),
    ]);
    if (objectType === ObjectType.BLOB)
    {
        const [fileType, fileSize] = await Promise.all([
            Git.getFileType(repositoryPath, objectHash),
            Git.getFileSize(repositoryPath, objectHash),
        ]);
        return new ServiceResponse<{ objectType: ObjectType | null; fileType: string | null; fileSize: number | null } | void>(
            200, {},
            new ResponseBody(true, '', {objectType, fileType, fileSize}));
    }
    else
    {
        return new ServiceResponse<{ objectType: ObjectType | null; fileType: string | null; fileSize: number | null } | void>(
            200, {},
            new ResponseBody(true, '', {objectType, fileType: null, fileSize: null}));
    }
}

export async function rawFile(account: Readonly<Pick<Account, 'username'>>, repository: Readonly<Pick<Repository, 'name'>>, filePath: string, commitHash: string, usernameInSession: ISession['username']): Promise<ServiceResponse<Readable | void>>
{
    const {username} = account;
    const {name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        if (await Git.fileExists(repositoryPath, filePath, commitHash))
        {
            // 获取对象哈希
            const objectHash = await Git.getFileObjectHash(repositoryPath, filePath, commitHash);
            return new ServiceResponse<Readable>(200,
                {'Content-Type': mime.contentType(path.extname(filePath)) || 'application/octet-stream'},
                Git.getFileReadStream(repositoryPath, objectHash));
        }
        else
        {
            return new ServiceResponse<void>(404, {},
                new ResponseBody(false, '分支、提交或文件不存在'));
        }
    }
    catch (e)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '分支或提交不存在'));
    }
}

export async function setName(repository: Readonly<Pick<Repository, 'name'>>, newRepository: Readonly<Pick<Repository, 'name'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {name: repositoryName} = repository;
    const {name: newRepositoryName} = newRepository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({
        username: usernameInSession,
        name: repositoryName,
    });
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${usernameInSession}/${repositoryName} 不存在`));
    }
    if ((await RepositoryTable.selectByUsernameAndName({
        username: usernameInSession,
        name: newRepositoryName,
    })) !== null)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `仓库 ${usernameInSession}/${newRepositoryName} 已存在`));
    }

    const repositoryPath = RepositoryFunction.generateRepositoryPath({
        username: usernameInSession,
        name: repositoryName,
    });
    const newRepoPath = RepositoryFunction.generateRepositoryPath({
        username: usernameInSession,
        name: newRepositoryName,
    });
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

export async function setDescription(repository: Readonly<Pick<Repository, 'name' | 'description'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {name: repositoryName, description} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({
        username: usernameInSession,
        name: repositoryName,
    });
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${usernameInSession}/${repositoryName} 不存在`));
    }
    await RepositoryTable.update({description}, {username: usernameInSession, name: repositoryName});
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function setIsPublic(repository: Readonly<Pick<Repository, 'name' | 'isPublic'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {name, isPublic} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username: usernameInSession, name});
    if (repositoryInDatabase !== null && !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${usernameInSession}/${name} 不存在`));
    }
    await RepositoryTable.update({isPublic}, {username: usernameInSession, name});
    if (!isPublic)   // 当改为私有时，清空所有相关 Star
    {
        await StarTable.del({repositoryUsername: usernameInSession, repositoryName: name});
    }
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true));
}

export async function commitHistoryBetweenCommits(repository: Pick<Repository, 'username' | 'name'>, baseCommitHash: string, targetCommitHash: string, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commits: Commit[], } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    try
    {
        const commits = await Git.getRepositoryCommitsBetweenCommits(repositoryPath, baseCommitHash, targetCommitHash, offset, limit);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {commits}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交不存在'));
    }
}

export async function commitHistory(repository: Pick<Repository, 'username' | 'name'>, targetCommitHash: string, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commits: Commit[], } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const commits = await Git.getRepositoryCommits(repositoryPath, targetCommitHash, offset, limit);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {commits}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交不存在'));
    }
}

export async function fileCommitHistoryBetweenCommits(repository: Pick<Repository, 'username' | 'name'>, filePath: string, baseCommitHash: string, targetCommitHash: string, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commits: Commit[], } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const commits = await Git.getFileCommitsBetweenCommits(repositoryPath, filePath, baseCommitHash, targetCommitHash, offset, limit);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {commits}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交或文件不存在'));
    }
}

export async function fileCommitHistory(repository: Pick<Repository, 'username' | 'name'>, filePath: string, targetCommitHash: string, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commits: Commit[], } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));

    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const commits = await Git.getFileCommits(repositoryPath, filePath, targetCommitHash, offset, limit);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {commits}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交或文件不存在'));
    }

}

export async function diffBetweenCommits(repository: Pick<Repository, 'username' | 'name'>, baseCommitHash: string, targetCommitHash: string, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ diff: FileDiff[] } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const diffFiles = await Git.getChangedFilesBetweenCommits(repositoryPath, baseCommitHash, targetCommitHash, offset, limit);
        const fileDiffs = await Promise.all(diffFiles.map(
            async filePath =>
                await Git.getFileDiffInfoBetweenCommits(repositoryPath, filePath, baseCommitHash, targetCommitHash)),
        );
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {diff: fileDiffs}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交不存在'));
    }
}

export async function diffAmountBetweenCommits(repository: Pick<Repository, 'username' | 'name'>, baseCommitHash: string, targetCommitHash: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ amount: number } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const diffFiles = await Git.getChangedFilesBetweenCommits(repositoryPath, baseCommitHash, targetCommitHash);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {amount: diffFiles.length}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交不存在'));
    }
}

export async function fileDiffBetweenCommits(repository: Pick<Repository, 'username' | 'name'>, filePath: string, baseCommitHash: string, targetCommitHash: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ diff: FileDiff } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const diff = await Git.getFileDiffInfoBetweenCommits(repositoryPath, filePath, baseCommitHash, targetCommitHash);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {diff}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交或文件不存在'));
    }
}

export async function commit(repository: Pick<Repository, 'username' | 'name'>, commitHash: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commit: Commit } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const commit = await Git.getCommit(repositoryPath, commitHash);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {commit}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交不存在'));
    }
}

export async function commitDiff(repository: Pick<Repository, 'username' | 'name'>, commitHash: string, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ diff: FileDiff[] } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const diff = await Git.getCommitFileDiffs(repositoryPath, commitHash, offset, limit);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {diff}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交不存在'));
    }
}

export async function commitDiffAmount(repository: Pick<Repository, 'username' | 'name'>, commitHash: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ amount: number } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const changedFiles = await Git.getChangedFiles(repositoryPath, commitHash);
        const amount = changedFiles.length;
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {amount}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交不存在'));
    }
}

export async function fileCommit(repository: Pick<Repository, 'username' | 'name'>, filePath: string, commitHash: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commit: Commit, diff: FileDiff } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const repositoryPath = RepositoryFunction.generateRepositoryPath(repository);
    try
    {
        const [commit, diff] = await Promise.all([
            Git.getCommit(repositoryPath, commitHash),
            Git.getFileDiff(repositoryPath, filePath, commitHash),
        ]);
        return new ServiceResponse(200, {},
            new ResponseBody(true, '', {commit, diff}));
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e);
        return new ServiceResponse(404, {},
            new ResponseBody(false, '提交或文件不存在'));
    }
}

export async function forkAmount(repository: Pick<Repository, 'username' | 'name'>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ amount: number } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
    const amount = await ForkTable.count({
        sourceRepositoryUsername: username,
        sourceRepositoryName: name,
    });
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}

export async function forkRepositories(repository: Pick<Repository, 'username' | 'name'>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ repositories: Repository[] } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }
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

export async function forkFrom(repository: Pick<Repository, 'username' | 'name'>, usernameInSession: ISession['username']): Promise<ServiceResponse<{ repository: Pick<Repository, 'username' | 'name'> | null } | void>>
{
    const {username, name} = repository;
    const repositoryInDatabase = await RepositoryTable.selectByUsernameAndName({username, name});
    if (repositoryInDatabase === null || !await hasReadAuthority(repositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, `仓库 ${username}/${name} 不存在`));
    }

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

export async function forkCommitHistory(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>, sourceRepositoryBranch: string, targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>, targetRepositoryBranch: string, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commits: Commit[] } | void>>
{
    const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
    const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
    // 检查仓库存在性和可访问性
    const [sourceRepositoryInDatabase, targetRepositoryInDatabase] = await Promise.all([
        RepositoryTable.selectByUsernameAndName({username: sourceRepositoryUsername, name: sourceRepositoryName}),
        RepositoryTable.selectByUsernameAndName({username: targetRepositoryUsername, name: targetRepositoryName}),
    ]);
    if (sourceRepositoryInDatabase === null || !await hasReadAuthority(sourceRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 不存在`));
    }
    if (targetRepositoryInDatabase === null || !await hasReadAuthority(targetRepositoryInDatabase, {username: usernameInSession}))
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
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranch),
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
    const commits = await Git.getCommitsBetweenForks(targetRepositoryPath, targetRepositoryBranch, sourceRepositoryPath, sourceRepositoryBranch, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commits}));
}

export async function forkCommitAmount(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>, sourceRepositoryBranch: string, targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>, targetRepositoryBranch: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ commitAmount: number } | void>>
{
    const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
    const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
    // 检查仓库存在性和可访问性
    const [sourceRepositoryInDatabase, targetRepositoryInDatabase] = await Promise.all([
        RepositoryTable.selectByUsernameAndName({username: sourceRepositoryUsername, name: sourceRepositoryName}),
        RepositoryTable.selectByUsernameAndName({username: targetRepositoryUsername, name: targetRepositoryName}),
    ]);
    if (sourceRepositoryInDatabase === null || !await hasReadAuthority(sourceRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 不存在`));
    }
    if (targetRepositoryInDatabase === null || !await hasReadAuthority(targetRepositoryInDatabase, {username: usernameInSession}))
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
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranch),
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
    const commitAmount = await Git.getCommitCountBetweenRepositoriesBranches(targetRepositoryPath, targetRepositoryBranch, sourceRepositoryPath, sourceRepositoryBranch);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {commitAmount}));
}

export async function forkFileDiff(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>, sourceRepositoryBranch: string, targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>, targetRepositoryBranch: string, offset: number, limit: number, usernameInSession: ISession['username']): Promise<ServiceResponse<{ fileDiffs: FileDiff[] } | void>>
{
    const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
    const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
    // 检查仓库存在性和可访问性
    const [sourceRepositoryInDatabase, targetRepositoryInDatabase] = await Promise.all([
        RepositoryTable.selectByUsernameAndName({username: sourceRepositoryUsername, name: sourceRepositoryName}),
        RepositoryTable.selectByUsernameAndName({username: targetRepositoryUsername, name: targetRepositoryName}),
    ]);
    if (sourceRepositoryInDatabase === null || !await hasReadAuthority(sourceRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 不存在`));
    }
    if (targetRepositoryInDatabase === null || !await hasReadAuthority(targetRepositoryInDatabase, {username: usernameInSession}))
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
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranch),
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
    const fileDiffs = await Git.getFileDiffsBetweenForks(targetRepositoryPath, targetRepositoryBranch, sourceRepositoryPath, sourceRepositoryBranch, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {fileDiffs}));
}

export async function forkFileDiffAmount(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>, sourceRepositoryBranch: string, targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>, targetRepositoryBranch: string, usernameInSession: ISession['username']): Promise<ServiceResponse<{ amount: number } | void>>
{
    const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
    const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
    // 检查仓库存在性和可访问性
    const [sourceRepositoryInDatabase, targetRepositoryInDatabase] = await Promise.all([
        RepositoryTable.selectByUsernameAndName({username: sourceRepositoryUsername, name: sourceRepositoryName}),
        RepositoryTable.selectByUsernameAndName({username: targetRepositoryUsername, name: targetRepositoryName}),
    ]);
    if (sourceRepositoryInDatabase === null || !await hasReadAuthority(sourceRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 不存在`));
    }
    if (targetRepositoryInDatabase === null || !await hasReadAuthority(targetRepositoryInDatabase, {username: usernameInSession}))
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
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranch),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranch),
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
    // 获取文件差异数量
    const changedFiles = await Git.getChangedFilesBetweenForks(targetRepositoryPath, targetRepositoryBranch, sourceRepositoryPath, sourceRepositoryBranch);
    const amount = changedFiles.length;
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {amount}));
}

export async function hasCommonAncestor(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>,
                                        sourceRepositoryBranchName: string,
                                        targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>,
                                        targetRepositoryBranchName: string,
                                        usernameInSession: ISession['username']): Promise<ServiceResponse<{ hasCommonAncestor: boolean } | void>>
{
    const {username: sourceRepositoryUsername, name: sourceRepositoryName} = sourceRepository;
    const {username: targetRepositoryUsername, name: targetRepositoryName} = targetRepository;
    // 检查仓库存在性和可访问性
    const [sourceRepositoryInDatabase, targetRepositoryInDatabase] = await Promise.all([
        RepositoryTable.selectByUsernameAndName({username: sourceRepositoryUsername, name: sourceRepositoryName}),
        RepositoryTable.selectByUsernameAndName({username: targetRepositoryUsername, name: targetRepositoryName}),
    ]);
    if (sourceRepositoryInDatabase === null || !await hasReadAuthority(sourceRepositoryInDatabase, {username: usernameInSession}))
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 不存在`));
    }
    if (targetRepositoryInDatabase === null || !await hasReadAuthority(targetRepositoryInDatabase, {username: usernameInSession}))
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
        Git.hasBranch(sourceRepositoryPath, sourceRepositoryBranchName),
        Git.hasBranch(targetRepositoryPath, targetRepositoryBranchName),
    ]);
    if (!sourceRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${sourceRepositoryUsername}/${sourceRepositoryName} 分支 ${sourceRepositoryBranchName} 不存在`));
    }
    if (!targetRepositoryHasBranch)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `仓库 ${targetRepositoryUsername}/${targetRepositoryName} 分支 ${targetRepositoryBranchName} 不存在`));
    }
    const hasCommonAncestor = await Git.hasCommonAncestor(sourceRepositoryPath, sourceRepositoryBranchName,
        targetRepositoryPath, targetRepositoryBranchName);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {hasCommonAncestor}));
}