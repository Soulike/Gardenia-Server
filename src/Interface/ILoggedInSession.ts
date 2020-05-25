import {ISession} from './ISession';

export interface ILoggedInSession extends ISession
{
    // 登录后 username 应当排除 undefined
    readonly username: Pick<Required<ISession>, 'username'>['username']
}