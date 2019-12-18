import {IRouteHandler} from '../Interface';
import koaBody, {IKoaBodyOptions} from 'koa-body';
import {WrongParameterError} from '../Class';
import compose from 'koa-compose';

const bodyParser: IRouteHandler = () => compose([
    // 调用 koa-body 解析请求体
    koaBody({
        multipart: true,
        onError: () =>
        {
            throw new WrongParameterError();
        },
    } as IKoaBodyOptions),
    async (ctx, next) =>
    {
        if (ctx.request.body === null)  // 如果解析结果是 null，抛出错误
        {
            throw new WrongParameterError();
        }
        await next();
    },
]);

export default bodyParser;