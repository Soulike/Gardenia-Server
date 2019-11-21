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
export async function repositoryIsAvailableToTheRequest(repository: Readonly<RepositoryClass>, headers: any): Promise<boolean>
{
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