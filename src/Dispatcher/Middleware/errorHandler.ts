import {SERVER} from '../../CONFIG';
import {IRouteHandler} from '../Interface';

const errorHandler: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        try
        {
            await next();
        }
        catch (e)
        {
            if (e instanceof Error)
            {
                ctx.response.status = 500;
                SERVER.ERROR_LOGGER(e);
            }
            else
            {
                ctx.state.serviceResponse = e;
            }
        }
    };
};

export default errorHandler;