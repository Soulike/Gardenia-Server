import bodyParser from '../../../Middleware/bodyParser';
import JSONQuerystringParser from '../../../Middleware/JSONQuerystringParser';
import * as Middleware from '../Middleware';
import http, {Server} from 'http';
import Koa from 'koa';
import Router from '@koa/router';
import {IContext, IState} from '../../../Interface';
import compose from 'koa-compose';
import superagent from 'superagent';
import {GET, SET, UPLOAD_AVATAR} from '../ROUTE';
import 'jest-extended';

const PORT = 10090;

function getFullURL(url: string): string
{
    return `http://localhost:${PORT}${url}`;
}

const bodyParserMock = jest.fn<ReturnType<typeof bodyParser>,
    Parameters<typeof bodyParser>>();
const JSONQuerystringParserMock = jest.fn<ReturnType<typeof JSONQuerystringParser>,
    Parameters<typeof JSONQuerystringParser>>();

// 返回的中间件的 mock
const bodyParserMiddlewareMock = jest.fn<ReturnType<ReturnType<typeof bodyParser>>,
    Parameters<ReturnType<typeof bodyParser>>>();
const JSONQuerystringParserMiddlewareMock = jest.fn<ReturnType<ReturnType<typeof JSONQuerystringParser>>,
    Parameters<ReturnType<typeof JSONQuerystringParser>>>();

const MiddlewareWrapperMock = {
    get: jest.fn<ReturnType<typeof Middleware.get>, Parameters<typeof Middleware.get>>(),
    set: jest.fn<ReturnType<typeof Middleware.set>, Parameters<typeof Middleware.set>>(),
    uploadAvatar: jest.fn<ReturnType<typeof Middleware.uploadAvatar>, Parameters<typeof Middleware.uploadAvatar>>(),
};

let server: Server;

beforeEach(async () =>
{
    jest.resetAllMocks();
    Object.values(MiddlewareWrapperMock).forEach(mock => mock.mockImplementation(() => async (ctx) =>
    {
        ctx.response.status = 200;
    }));
    bodyParserMiddlewareMock.mockImplementation(async (_ctx, next) => await next());
    JSONQuerystringParserMiddlewareMock.mockImplementation(async (_ctx, next) => await next());
    bodyParserMock.mockImplementation(
        () => bodyParserMiddlewareMock);
    JSONQuerystringParserMock.mockImplementation(
        () => JSONQuerystringParserMiddlewareMock);
    jest.mock('../../../Middleware/bodyParser', () => bodyParserMock);
    jest.mock('../../../Middleware/JSONQuerystringParser', () => JSONQuerystringParserMock);
    jest.mock('../Middleware', () => MiddlewareWrapperMock);
    const {default: accountDispatcher} = await import('../Dispatcher');
    return new Promise(resolve =>
    {
        const app = new Koa();
        const router = new Router<IState, IContext>({
            methods: http.METHODS,
        });
        accountDispatcher(router);
        app.use(compose([
            router.routes(),
            router.allowedMethods(),
        ]));
        server = app.listen(PORT, resolve);
    });
});

afterEach(() =>
{
    server.close();
});

describe(`${GET}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(GET));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.get).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.get);
    });
});

describe(`${SET}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(SET));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.set).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.set);
    });
});

describe(`${UPLOAD_AVATAR}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(UPLOAD_AVATAR));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.uploadAvatar).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.uploadAvatar);
    });
});