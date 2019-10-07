import {Middleware} from 'koa';
import privateRepositoryJudge from './PrivateRepositoryJudge';

export default (): Middleware =>
{
    return async (ctx, next) =>
    {
        await privateRepositoryJudge()(ctx, next);
    };
}