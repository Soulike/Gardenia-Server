import {Notification, ResponseBody, ServiceResponse} from '../Class';
import {ILoggedInSession} from '../Interface';
import {Notification as NotificationDatabase} from '../Database';

export async function get(notification: Pick<Notification, 'confirmed'>, offset: number, limit: number, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<{ notifications: Notification[] } | void>>
{
    const {confirmed} = notification;
    const notifications = await NotificationDatabase.select(
        {username: usernameInSession, confirmed}, offset, limit);
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {notifications}));
}

export async function getCount(notification: Pick<Notification, 'confirmed'>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<{ count: number } | void>>
{
    const {confirmed} = notification;
    const count = await NotificationDatabase.count({username: usernameInSession, confirmed});
    return new ServiceResponse(200, {},
        new ResponseBody(true, '', {count}));
}

export async function setConfirmed(notifications: Readonly<Pick<Notification, 'id'>>[],
                                   confirmed: Notification['confirmed'], usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const notificationsInDatabase = await Promise.all(
        notifications.map(({id}) => NotificationDatabase.selectById(id)));
    const updates: Promise<any>[] = [];

    for (const notification of notificationsInDatabase)
    {
        if (notification !== null)   // 无视不存在的消息
        {
            const {username, id} = notification;
            if (usernameInSession !== username)
            {
                return new ServiceResponse<void>(200, {},
                    new ResponseBody(false, '不能设定他人消息状态'));
            }
            else
            {
                updates.push(NotificationDatabase.update({confirmed}, {id}));
            }
        }
    }
    await Promise.all(updates);
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true));
}