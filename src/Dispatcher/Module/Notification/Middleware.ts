import {IRouteHandler} from '../../Interface';
import {Notification as NotificationService} from '../../../Service';

export const get: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {notification, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await NotificationService.get(
            notification, offset, limit, username!);
    };
};

export const getCount: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {notification} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await NotificationService.getCount(
            notification, username!);
    };
};

export const setConfirmed: IRouteHandler = () =>
{
    return async (ctx) =>
    {
        const {notifications, confirmed} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await NotificationService.setConfirmed(
            notifications, confirmed, username!);
    };
};