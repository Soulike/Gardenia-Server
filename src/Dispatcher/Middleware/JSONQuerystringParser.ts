import 'koa-body';
import {IRouteHandler} from '../Interface';
import {WrongParameterError} from '../Class';

/**
 * @description koa 中间件，可以将 GET 请求查询字符串中名为 json 的参数内容自动转换为对象放置在 ctx.request.body 中
 * */
const JSONQuerystringParser: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        const {json} = ctx.request.query;
        if (typeof json === 'undefined') // 如果没有请求字符串，跳过
        {
            ctx.request.body = {};
            return await next();
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

export default JSONQuerystringParser;