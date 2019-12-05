import {IRouteHandler} from '../Interface';
import {ServiceResponse} from '../../Class';
import {Readable} from 'stream';
import {Promisify} from '../../Function';

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
            if (body instanceof Readable)
            {
                ctx.response.status = statusCode;
                body.pipe(ctx.res);
                await Promisify.waitForEvent(body, 'end');
            }
            else
            {
                ctx.response.body = body;
                ctx.response.status = statusCode;
            }
        }
    };
};

export default responseHandler;