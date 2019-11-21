import {Account, Repository as RepositoryClass} from '../Class';
import * as Authentication from './Authentication';
import {Account as AccountTable} from '../Database';

export function repositoryIsAvailableToTheViewer(repository: Readonly<RepositoryClass | null>, viewer: Readonly<Pick<Account, 'username'>>): boolean
{
    let isAvailable = false;
    if (repository === null)
    {
        isAvailable = false;
    }
    else    // repository !== null
    {
        const {isPublic} = repository;
        if (isPublic)
        {
            isAvailable = true;
        }
        else    // !isPublic
        {
            const {username} = repository;
            const {username: usernameOfViewer} = viewer;
            isAvailable = username === usernameOfViewer;
        }
    }
    return isAvailable;
}

/**
 * @description 通过 HTTP 请求的 headers 判断此次请求是否可以访问指定仓库
 * */
export async function repositoryIsAvailableToTheRequest(repository: Readonly<RepositoryClass>, headers: Readonly<any>): Promise<boolean>
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
        && (await repositoryIsAvailableToTheViewer(repository, {username: accountInDatabase.username})));
}

/**
 * @description 通过 HTTP 请求的 headers 判断此次请求是否可以修改指定仓库（push 之类）
 * */
export async function repositoryIsModifiableToTheRequest(repository: Readonly<RepositoryClass>, headers: Readonly<any>): Promise<boolean>
{
    const accountFromHeader = Authentication.getAccountFromAuthenticationHeader(headers);
    if (accountFromHeader === null) // 没有认证信息
    {
        return false;
    }
    const accountInDatabase = await AccountTable.selectByUsername(accountFromHeader.username);
    // 用户存在 && 密码正确 && 仓库是该账号的仓库
    return (accountInDatabase !== null
        && accountInDatabase.hash === accountFromHeader.hash
        && repository.username === accountInDatabase.username);
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