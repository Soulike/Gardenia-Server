import bodyParser from '../bodyParser';
import Koa from 'koa';
import Application from 'koa';
import {Server} from 'http';
import superagent from 'superagent';
import {WrongParameterError} from '../../Class';

describe('bodyParser', () =>
{
    const PORT = 56468;
    const URL = `http://localhost:${PORT}`;
    let app: Application;
    let server: Server;
    const middlewareMock = jest.fn(async () => {}); // mock 一个中间件，充当 bodyParser 的 next
    const middlewareWrapper = () => middlewareMock;

    beforeEach(() =>
    {
        jest.resetAllMocks();
    });

    beforeAll(async () =>
    {
        app = new Koa();
        // 把响应结果或抛出的错误返回
        app.use(async (ctx, next) =>
        {
            try
            {
                await next();
                ctx.response.body = ctx.request.body;
            }
            catch (e)
            {
                ctx.response.body = e;
            }
        });
        app.use(bodyParser());  // 解析请求体
        app.use(middlewareWrapper());   // bodyParser 的 next
        return new Promise(resolve => server = app.listen(PORT, resolve));
    });

    afterAll(async () =>
    {
        return new Promise(resolve => server.close(resolve));
    });

    it('should handle request body in JSON', async function ()
    {
        // 应当正常解析 JSON
        const requestBody = {a: 'b', c: 2};
        const {body} = await superagent.post(URL).send(requestBody);
        expect(body).toEqual(requestBody);
        expect(middlewareMock).toBeCalledTimes(1);  // 应当执行 next
    });

    it('should handle request body in JSON("null")', async function ()
    {
        // 请求体是 null 则抛出错误
        const requestBody = 'null';
        const {body} = await superagent.post(URL).type('application/json').send(requestBody);
        expect(body).toEqual(new WrongParameterError());
        expect(middlewareMock).not.toBeCalled();  // 不应当执行 next
    });

    it('should handle empty request body', async function ()
    {
        // 没有请求体，解析结果是 {}
        const {body} = await superagent.post(URL);
        expect(body).toEqual({});
        expect(middlewareMock).toBeCalledTimes(1);  // 应当执行 next
    });

    it('should handle multipart(file) request', async function ()
    {
        // 请求体是文件，解析结果是 {}
        const {body} = await superagent.post(URL).attach('file', 'package.json');
        expect(body).toEqual({});
        expect(middlewareMock).toBeCalledTimes(1);  // 应当执行 next
    });
});