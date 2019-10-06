import {Middleware} from 'koa';
import {Repository} from '../../../Database';
import requestMethodJudge from './RequestMethodJudge';
import authentication from './Authentication';

export default (): Middleware =>
{
    return async (ctx, next) =>
    {
        const {params} = ctx;
        const username = params[0];
        const repositoryName = params[1];
        const repository = await Repository.select(username, repositoryName);
        if (repository === null)
        {
            ctx.response.status = 404;
            ctx.response.body = '仓库不存在';
            return;
        }
        const {isPublic} = repository;
        if (isPublic)
        {
            await requestMethodJudge()(ctx, next);
        }
        else
        {
            await authentication()(ctx, next);
        }
    };
}