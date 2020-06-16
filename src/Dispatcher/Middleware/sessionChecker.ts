import {IRouteHandler} from '../Interface';
import {InvalidSessionError} from '../Class';

const sessionChecker: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {username} = ctx.session;
        if (typeof username !== 'string')
        {
            throw new InvalidSessionError();
        }
        else
        {
            await next();
        }
    };
};

export default sessionChecker;