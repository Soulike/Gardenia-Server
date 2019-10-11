import {MiddlewareWrapper} from '../Interface';
import {ServiceResponse} from '../../Class';

const middlewareWrapper: MiddlewareWrapper = () =>
{
    return async (ctx, next) =>
    {
        await next();

        const {serviceResponse} = ctx.state;
        if (serviceResponse instanceof ServiceResponse)
        {
            const {statusCode, headers, body} = serviceResponse;
            if (headers)
            {
                ctx.response.set(headers);
            }
            ctx.response.body = body;
            ctx.response.status = statusCode;
        }
    };
};

export default middlewareWrapper;