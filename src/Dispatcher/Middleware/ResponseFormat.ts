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
            ctx.response.status = statusCode;
            if (body instanceof Readable)
            {
                body.pipe(ctx.res);
                await waitForEvent(body, 'close');
            }
            else
            {
                ctx.response.body = body;
            }
        }
    };
};

export default middlewareWrapper;