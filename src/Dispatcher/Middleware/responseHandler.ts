import {IRouteHandler} from '../Interface';
import {ServiceResponse} from '../../Class';

const responseHandler: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        await next();

        const {serviceResponse} = ctx.state;
        if (serviceResponse instanceof ServiceResponse)
        {
            const {statusCode, headers, body, session} = serviceResponse;
            ctx.response.set(headers);
            ctx.session = {...ctx.session, ...session};
            // 注意以下两者不能调换位置，否则会出现返回 204
            ctx.response.body = body;
            ctx.response.status = statusCode;
        }
    };
};

export default responseHandler;