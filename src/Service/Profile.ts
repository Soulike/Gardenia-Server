import {Account, Profile as ProfileClass, ResponseBody, ServiceResponse} from '../Class';
import {Profile as ProfileTable} from '../Database';
import {Session} from 'koa-session';
import {InvalidSessionError} from '../Dispatcher/Class';

export async function get(session: Session, account?: Readonly<Pick<Account, 'username'>>): Promise<ServiceResponse<ProfileClass | void>>
{
    if (typeof account === 'undefined' && typeof session.username !== 'string')
    {
        throw new InvalidSessionError();
    }
    const {username} = account || session;
    const profile = await ProfileTable.selectByUsername(username);
    if (profile === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '用户不存在'));
    }
    return new ServiceResponse<ProfileClass>(200, {},
        new ResponseBody<ProfileClass>(true, '', profile));
}