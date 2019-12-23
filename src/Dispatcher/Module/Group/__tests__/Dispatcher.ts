import bodyParser from '../../../Middleware/bodyParser';
import JSONQuerystringParser from '../../../Middleware/JSONQuerystringParser';
import * as Middleware from '../Middleware';
import http, {Server} from 'http';
import Koa from 'koa';
import Router from '@koa/router';
import {IContext, IState} from '../../../Interface';
import compose from 'koa-compose';
import superagent from 'superagent';
import {
    ACCOUNTS,
    ADD,
    ADD_ACCOUNTS,
    ADD_ADMINS,
    ADMINS,
    DISMISS,
    INFO,
    IS_ADMIN,
    REMOVE_ACCOUNTS,
    REMOVE_ADMINS,
    REMOVE_REPOSITORIES,
    REPOSITORIES,
} from '../ROUTE';
import 'jest-extended';

const PORT = 10089;

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
    accounts: jest.fn<ReturnType<typeof Middleware.accounts>, Parameters<typeof Middleware.accounts>>(),
    add: jest.fn<ReturnType<typeof Middleware.add>, Parameters<typeof Middleware.add>>(),
    addAccounts: jest.fn<ReturnType<typeof Middleware.addAccounts>, Parameters<typeof Middleware.addAccounts>>(),
    addAdmins: jest.fn<ReturnType<typeof Middleware.addAdmins>, Parameters<typeof Middleware.addAdmins>>(),
    admins: jest.fn<ReturnType<typeof Middleware.admins>, Parameters<typeof Middleware.admins>>(),
    dismiss: jest.fn<ReturnType<typeof Middleware.dismiss>, Parameters<typeof Middleware.dismiss>>(),
    info: jest.fn<ReturnType<typeof Middleware.info>, Parameters<typeof Middleware.info>>(),
    isAdmin: jest.fn<ReturnType<typeof Middleware.isAdmin>, Parameters<typeof Middleware.isAdmin>>(),
    removeAccounts: jest.fn<ReturnType<typeof Middleware.removeAccounts>, Parameters<typeof Middleware.removeAccounts>>(),
    removeAdmins: jest.fn<ReturnType<typeof Middleware.removeAdmins>, Parameters<typeof Middleware.removeAdmins>>(),
    removeRepositories: jest.fn<ReturnType<typeof Middleware.removeRepositories>, Parameters<typeof Middleware.removeRepositories>>(),
    repositories: jest.fn<ReturnType<typeof Middleware.repositories>, Parameters<typeof Middleware.repositories>>(),
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

describe(`${ADD}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(ADD));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.add).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.add);
    });
});

describe(`${DISMISS}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(DISMISS));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.dismiss).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.dismiss);
    });
});

describe(`${INFO}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(INFO));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.info).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.info);
    });
});

describe(`${ACCOUNTS}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(ACCOUNTS));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.accounts).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.accounts);
    });
});

describe(`${ADD_ACCOUNTS}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(ADD_ACCOUNTS));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.accounts).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.accounts);
    });
});

describe(`${REMOVE_ACCOUNTS}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(REMOVE_ACCOUNTS));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.removeAccounts).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.removeAccounts);
    });
});

describe(`${ADMINS}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(ADMINS));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.admins).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.admins);
    });
});

describe(`${ADD_ADMINS}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(ADD_ADMINS));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.addAdmins).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.addAdmins);
    });
});

describe(`${REMOVE_ADMINS}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(REMOVE_ADMINS));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.removeAdmins).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.removeAdmins);
    });
});

describe(`${IS_ADMIN}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(IS_ADMIN));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.isAdmin).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.isAdmin);
    });
});

describe(`${REPOSITORIES}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(REPOSITORIES));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.repositories).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.repositories);
    });
});

describe(`${REMOVE_REPOSITORIES}`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(REMOVE_REPOSITORIES));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.removeRepositories).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.removeRepositories);
    });
});