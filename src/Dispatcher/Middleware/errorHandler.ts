import {SERVER} from '../../CONFIG';
import {IRouteHandler} from '../Interface';
import {ServiceResponse} from '../../Class';

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
            if (e instanceof ServiceResponse)
            {
                ctx.state.serviceResponse = e;
            }
            else
            {
                ctx.response.status = 500;
                SERVER.ERROR_LOGGER(`${e.stack}\n请求体：${JSON.stringify(ctx.request.body)}`);
            }
        }
    };
};

export default errorHandler;