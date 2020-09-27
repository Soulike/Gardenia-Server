import {Repository} from '../Class';
import * as Authentication from './Authentication';
import {Account as AccountTable, PullRequest as PullRequestTable} from '../Database';
import {PULL_REQUEST_STATUS} from '../CONSTANT';
import path from 'path';
import {GIT} from '../CONFIG';
import {hasReadAuthority, hasWriteAuthority} from '../RepositoryAuthorityCheck';

/**
 * @description 通过 HTTP 请求的 headers 判断此次请求是否可以访问指定仓库
 * */
export async function repositoryIsReadableToTheRequest(repository: Readonly<Repository>, headers: Readonly<any>): Promise<boolean>
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
        && await hasReadAuthority(repository, {username: accountInDatabase.username}));
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
        && await hasWriteAuthority(repository, {username: accountInDatabase.username}));
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