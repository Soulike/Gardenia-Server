import {Middleware} from 'koa';
import privateRepositoryJudge from './PrivateRepositoryJudge';

export default (): Middleware =>
{
    return async (ctx, next) =>
    {
        try
        {
            await privateRepositoryJudge()(ctx, next);
        }
        finally
        {
            // 什么都不做
        }
    };
}