import {MiddlewareOptions} from 'koa-ratelimit';
import {RateLimit} from '../RAMDatabase';

export const RATE_LIMIT: MiddlewareOptions = {
    driver: 'redis',
    db: RateLimit,
    duration: 60 * 1000,
    disableHeader: false,
    id: ctx => ctx.ip,
    headers: {
        remaining: 'Rate-Limit-Remaining',
        reset: 'Rate-Limit-Reset',
        total: 'Rate-Limit-Total',
    },
    errorMessage: '请求过于频繁，请稍后再试',
};