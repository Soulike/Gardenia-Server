import 'koa-body';
import {MiddlewareWrapper} from '../Interface';
import {WrongParameterError} from '../Class';

/**
 * @description koa 中间件，可以将 GET 请求查询字符串中名为 json 的参数内容自动转换为对象放置在 ctx.request.body 中
 * */
const middlewareWrapper: MiddlewareWrapper = () =>
{
    return async (ctx, next) =>
    {
        const {json} = ctx.request.query;
        if (typeof json !== 'string')
        {
            throw new WrongParameterError();
        }
        try
        {
            ctx.request.body = JSON.parse(json);
            await next();
        }
        catch (e)
        {
            if (e instanceof SyntaxError)    // parse 方法报错
            {
                throw new WrongParameterError();
            }
            else
            {
                throw e;
            }
        }
    };
};

export default middlewareWrapper;