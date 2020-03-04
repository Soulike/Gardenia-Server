import bodyParser from '../../../Middleware/bodyParser';
import JSONQuerystringParser from '../../../Middleware/JSONQuerystringParser';
import * as Middleware from '../Middleware';
import http, {Server} from 'http';
import Koa from 'koa';
import Router from '@koa/router';
import {IContext, IState} from '../../../Interface';
import compose from 'koa-compose';
import superagent from 'superagent';
import 'jest-extended';
import {CREATE, DEL, GET_REPOSITORIES} from '../ROUTE';

const PORT = 15124;

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
    getRepositories: jest.fn<ReturnType<typeof Middleware.getRepositories>, Parameters<typeof Middleware.getRepositories>>(),
    create: jest.fn<ReturnType<typeof Middleware.create>, Parameters<typeof Middleware.create>>(),
    del: jest.fn<ReturnType<typeof Middleware.del>, Parameters<typeof Middleware.del>>(),
    fork: jest.fn<ReturnType<typeof Middleware.fork>, Parameters<typeof Middleware.fork>>(),
    isMergeable: jest.fn<ReturnType<typeof Middleware.isMergeable>, Parameters<typeof Middleware.isMergeable>>(),
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
    const {default: repositoryDispatcher} = await import('../Dispatcher');
    return new Promise(resolve =>
    {
        const app = new Koa();
        const router = new Router<IState, IContext>({
            methods: http.METHODS,
        });
        repositoryDispatcher(router);
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

describe(`GET_REPOSITORIES`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(GET_REPOSITORIES));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.getRepositories).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.getRepositories);
    });
});

describe(`CREATE`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(CREATE));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.create).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.create);
    });
});

describe(`DEL`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(DEL));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.del).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.del);
    });
});