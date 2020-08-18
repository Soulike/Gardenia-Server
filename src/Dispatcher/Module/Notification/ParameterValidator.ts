import {IRouteHandler} from '../../Interface';
import {Notification} from '../../../Class';
import {WrongParameterError} from '../../Class';
import {LIMITS} from '../../../CONFIG';

export const get: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {notification, offset, limit} = ctx.request.body;
        if (notification === undefined || notification === null)
        {
            throw new WrongParameterError();
        }
        const {confirmed} = notification;
        if (Notification.validate({
                username: '', confirmed, timestamp: 0, type: '', content: '', id: 0,
            }) && typeof offset === 'number'
            && typeof limit === 'number'
            && limit <= LIMITS.NOTIFICATIONS)
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const getCount: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {notification} = ctx.request.body;
        if (notification === undefined || notification === null)
        {
            throw new WrongParameterError();
        }
        const {confirmed} = notification;
        if (Notification.validate({
            username: '', confirmed, timestamp: 0, type: '', content: '', id: 0,
        }))
        {
            await next();
        }
        else
        {
            throw new WrongParameterError();
        }
    };
};

export const setConfirmed: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {notifications, confirmed} = ctx.request.body;
        if (notifications === undefined || notifications === null
            || !Notification.validate({
                username: '', confirmed, timestamp: 0, type: '', content: '', id: 0,
            }))
        {
            throw new WrongParameterError();
        }
        for (const {id} of notifications)
        {
            if (!Notification.validate({
                username: '', confirmed: true, timestamp: 0, type: '', content: '', id,
            }))
            {
                throw new WrongParameterError();
            }
        }
        await next();
    };
};