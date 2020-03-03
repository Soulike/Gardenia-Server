import {Account, AccountRepository, Repository} from '../Class';
import * as Authentication from './Authentication';
import {Account as AccountTable, Collaborate as CollaborateTable, PullRequest as PullRequestTable} from '../Database';
import {redis} from '../Singleton';
import {PULL_REQUEST_STATUS} from '../CONSTANT';
import path from 'path';
import {GIT} from '../CONFIG';

export async function repositoryIsAvailableToTheViewer(repository: Readonly<Repository | null>, viewer: Readonly<{ username?: Account['username'] }>): Promise<boolean>
{
    if (repository === null)
    {
        return false;
    }
    else    // repository !== null
    {
        const {isPublic} = repository;
        if (isPublic)
        {
            return true;
        }
        else    // !isPublic
        {
            const {username, name} = repository;
            const {username: usernameOfViewer} = viewer;
            if (usernameOfViewer === undefined) // username !== usernameOfViewer
            {
                return false;
            }
            else if (username === usernameOfViewer)
            {
                return true;
            }
            else    // usernameOfViewer !== undefined
            {
                const amount = await CollaborateTable.count(new AccountRepository(usernameOfViewer, username, name));
                return amount === 1;
            }
        }
    }
}

export async function repositoryIsModifiableToTheViewer(repository: Readonly<Repository | null>, viewer: Readonly<{ username?: Account['username'] }>): Promise<boolean>
{
    if (repository === null)
    {
        return false;
    }
    const {username, name} = repository;
    const {username: usernameOfViewer} = viewer;
    if (repository.username === viewer.username)
    {
        return true;
    }
    else if (usernameOfViewer === undefined)    // repository.username !== viewer.username
    {
        return false;
    }
    else    // usernameOfView !== undefined
    {
        const amount = await CollaborateTable.count(new AccountRepository(usernameOfViewer, username, name));
        return amount === 1;
    }
}

/**
 * @description 通过 HTTP 请求的 headers 判断此次请求是否可以访问指定仓库
 * */
export async function repositoryIsAvailableToTheRequest(repository: Readonly<Repository>, headers: Readonly<any>): Promise<boolean>
{
    if (repository.isPublic)    // 公有仓库任何人都能查看
    {
        return true;
    }
    const accountFromHeader = Authentication.getAccountFromAuthenticationHeader(headers);
    if (accountFromHeader === null) // 没有认证信息
    {
        return false;
    }
    const accountInDatabase = await AccountTable.selectByUsername(accountFromHeader.username);
    // 用户存在 && 密码正确 && 仓库对该账号可见
    return (accountInDatabase !== null
        && accountInDatabase.hash === accountFromHeader.hash
        && await repositoryIsAvailableToTheViewer(repository, {username: accountInDatabase.username}));
}

/**
 * @description 通过 HTTP 请求的 headers 判断此次请求是否可以修改指定仓库（push 之类）
 * */
export async function repositoryIsModifiableToTheRequest(repository: Readonly<Repository>, headers: Readonly<any>): Promise<boolean>
{
    const accountFromHeader = Authentication.getAccountFromAuthenticationHeader(headers);
    if (accountFromHeader === null) // 没有认证信息
    {
        return false;
    }
    const accountInDatabase = await AccountTable.selectByUsername(accountFromHeader.username);
    // 用户存在 && 密码正确 && 仓库对该账号可修改
    return (accountInDatabase !== null
        && accountInDatabase.hash === accountFromHeader.hash
        && await repositoryIsModifiableToTheViewer(repository, {username: accountInDatabase.username}));
}

/**
 * @description 生成 refs 请求返回的正确格式
 * */
export function generateRefsServiceResponse(service: string, RPCCallOutput: string): string
{
    const serverAdvert = `# service=${service}`;
    const length = serverAdvert.length + 4;
    return `${length.toString(16).padStart(4, '0')}${serverAdvert}0000${RPCCallOutput}`;
}

export function generateCollaborateCode(repository: Pick<Repository, 'username' | 'name'>): string
{
    const {username, name} = repository;
    return `${username}_${name}_${Date.now()}`;
}

export async function setCollaborateCode(code: string, repository: Pick<Repository, 'username' | 'name'>): Promise<void>
{
    const result = await redis.set(code, JSON.stringify(repository), 'EX', 10 * 60);
    if (result !== 'OK')
    {
        throw new Error(result);
    }
}

export async function getCollaborateCodeRepository(code: string): Promise<Pick<Repository, 'username' | 'name'> | null>
{
    const result = await redis.get(code);
    if (result === null)
    {
        return null;
    }
    const {username, name} = JSON.parse(result);
    if (!Repository.validate(new Repository(username, name, '', true)))
    {
        return null;
    }
    return {username, name};
}

export async function deleteCollaborateCode(code: string): Promise<void>
{
    await redis.del(code);
}

export async function closePullRequestWithBranch(repository: Readonly<Pick<Repository, 'username' | 'name'>>, branchName: string): Promise<void>
{
    const {username, name} = repository;
    const [asSource, asTarget] = await Promise.all([
        PullRequestTable.select({
            sourceRepositoryUsername: username,
            sourceRepositoryName: name,
            sourceRepositoryBranchName: branchName,
            status: PULL_REQUEST_STATUS.OPEN,
        }),
        PullRequestTable.select({
            targetRepositoryUsername: username,
            targetRepositoryName: name,
            targetRepositoryBranchName: branchName,
            status: PULL_REQUEST_STATUS.OPEN,
        }),
    ]);
    const pullRequests = [...asSource, ...asTarget];
    await Promise.all(pullRequests.map(async ({id}) =>
        await PullRequestTable.update({status: PULL_REQUEST_STATUS.CLOSED},
            {id})));
}

export function generateRepositoryPath(repository: Readonly<Pick<Repository, 'username' | 'name'>>): string
{
    const {username, name} = repository;
    return path.join(GIT.ROOT, username, `${name}.git`);
}