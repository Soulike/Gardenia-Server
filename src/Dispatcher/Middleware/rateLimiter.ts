import {IRouteHandler} from '../Interface';
import rateLimit from 'koa-ratelimit';
import {RATE_LIMIT} from '../../CONFIG';

const rateLimiter: IRouteHandler<[number]> = (maxRequestAmountPerMinute: number) =>
{
    return async (ctx, next) =>
    {
        await rateLimit({...RATE_LIMIT, max: maxRequestAmountPerMinute})(ctx, next);
    };
};

export default rateLimiter;