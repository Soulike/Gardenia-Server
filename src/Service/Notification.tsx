import {Notification, ResponseBody, ServiceResponse} from '../Class';
import {ILoggedInSession} from '../Interface';
import {Notification as NotificationDatabase} from '../Database';

export async function get(notification: Pick<Notification, 'username' | 'confirmed'>, offset: number, limit: number, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<{ notifications: Notification[] } | void>>
{
    const {username, confirmed} = notification;
    if (username !== usernameInSession)
    {
        return new ServiceResponse(200, {},
            new ResponseBody(false, '不能获取他人消息'));
    }
    const notifications = await NotificationDatabase.select(
        {username, confirmed}, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {notifications}));
}