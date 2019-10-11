import {SERVER} from '../../CONFIG';
import {MiddlewareWrapper} from '../Interface';
import {ServiceResponse} from '../../Class';

const middlewareWrapper: MiddlewareWrapper = () =>
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
                SERVER.ERROR_LOGGER(e);
            }
        }
    };
};

export default middlewareWrapper;