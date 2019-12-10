import Router from '@koa/router';
import {IContext, IState} from '../../../Interface';
import http, {Server} from 'http';
import Koa from 'koa';
import compose from 'koa-compose';
import bodyParser from '../../../Middleware/bodyParser';
import JSONQuerystringParser from '../../../Middleware/JSONQuerystringParser';
import * as Middleware from '../Middleware';
import superagent from 'superagent';
import {CHECK_PASSWORD, CHECK_SESSION, GET_ADMINISTRATING_GROUPS, GET_GROUPS, LOGIN, LOGOUT, REGISTER} from '../ROUTE';
import 'jest-extended';

const PORT = 10086;

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
    login: jest.fn<ReturnType<typeof Middleware.login>,
        Parameters<typeof Middleware.login>>(),
    register: jest.fn<ReturnType<typeof Middleware.register>,
        Parameters<typeof Middleware.register>>(),
    checkSession: jest.fn<ReturnType<typeof Middleware.checkSession>,
        Parameters<typeof Middleware.checkSession>>(),
    logout: jest.fn<ReturnType<typeof Middleware.logout>,
        Parameters<typeof Middleware.logout>>(),
    getGroups: jest.fn<ReturnType<typeof Middleware.getGroups>,
        Parameters<typeof Middleware.getGroups>>(),
    getAdministratingGroups: jest.fn<ReturnType<typeof Middleware.getAdministratingGroups>,
        Parameters<typeof Middleware.getAdministratingGroups>>(),
    checkPassword: jest.fn<ReturnType<typeof Middleware.checkPassword>,
        Parameters<typeof Middleware.checkPassword>>(),
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

describe(`${LOGIN}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(LOGIN));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.login).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.login);
    });
});

describe(`${REGISTER}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(REGISTER));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.register).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.register);
    });
});

describe(`${CHECK_SESSION}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(CHECK_SESSION));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.checkSession).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.checkSession);
    });
});

describe(`${LOGOUT}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(LOGOUT));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.logout).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.logout);
    });
});

describe(`${GET_GROUPS}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(GET_GROUPS));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.getGroups).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.getGroups);
    });
});

describe(`${GET_ADMINISTRATING_GROUPS}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(GET_ADMINISTRATING_GROUPS));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.getGroups).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.getAdministratingGroups);
    });
});

describe(`${CHECK_PASSWORD}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(CHECK_PASSWORD));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.checkPassword).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.checkPassword);
    });
});