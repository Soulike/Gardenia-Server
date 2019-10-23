import {IRouteHandler} from '../Interface';
import {ServiceResponse} from '../../Class';

const middlewareWrapper: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        await next();

        const {serviceResponse} = ctx.state;
        if (serviceResponse instanceof ServiceResponse)
        {
            const {statusCode, headers, body, session} = serviceResponse;
            if (headers)
            {
                ctx.response.set(headers);
            }
            Object.assign(ctx.session, session);
            ctx.response.body = body;
            ctx.response.status = statusCode;
        }
    };
};

export default middlewareWrapper;