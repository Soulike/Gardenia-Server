import {IRouteHandler} from '../Interface';
import {ServiceResponse} from '../../Class';
import {Readable} from 'stream';
import {waitForEvent} from '../../Function/Promisify';

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
            if (body instanceof Readable)
            {
                ctx.response.status = statusCode;
                body.pipe(ctx.res);
                await waitForEvent(body, 'close');
            }
            else
            {
                ctx.response.body = body;
                ctx.response.status = statusCode;
            }
        }
    };
};

export default middlewareWrapper;