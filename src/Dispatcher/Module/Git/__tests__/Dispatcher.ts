import Router from '@koa/router';
import {IContext, IState} from '../../../Interface';
import http, {Server} from 'http';
import Koa from 'koa';
import compose from 'koa-compose';
import * as Middleware from '../Middleware';
import superagent from 'superagent';
import {ADVERTISE, FILE, RPC} from '../ROUTE';
import 'jest-extended';

const PORT = 10087;

function getFullURL(url: string): string
{
    return `http://localhost:${PORT}${url}`;
}

const MiddlewareWrapperMock = {
    file: jest.fn<ReturnType<typeof Middleware.file>,
        Parameters<typeof Middleware.file>>(),
    rpc: jest.fn<ReturnType<typeof Middleware.rpc>,
        Parameters<typeof Middleware.rpc>>(),
    advertise: jest.fn<ReturnType<typeof Middleware.advertise>,
        Parameters<typeof Middleware.advertise>>(),
};

let server: Server;

beforeEach(async () =>
{
    jest.resetAllMocks();
    Object.values(MiddlewareWrapperMock).forEach(mock => mock.mockImplementation(() => async (ctx) =>
    {
        ctx.response.status = 200;
    }));
    jest.mock('../Middleware', () => MiddlewareWrapperMock);
    const {default: gitDispatcher} = await import('../Dispatcher');
    return new Promise(resolve =>
    {
        const app = new Koa();
        const router = new Router<IState, IContext>({
            methods: http.METHODS,
        });
        gitDispatcher(router);
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

describe(`${ADVERTISE}`, () =>
{
    it('should run middlewares', async function ()
    {
        const fakeURL = '/a/b.git/info/refs';
        expect(ADVERTISE.test(fakeURL)).toBeTrue();
        await superagent.get(getFullURL(fakeURL));
        expect(MiddlewareWrapperMock.advertise).toBeCalledTimes(1);
    });
});

describe(`${FILE}`, () =>
{
    it('should run middlewares', async function ()
    {
        const fakeURL = '/a/b.git/aaa/bbb/ccc';
        expect(FILE.test(fakeURL)).toBeTrue();
        await superagent.get(getFullURL(fakeURL));
        expect(MiddlewareWrapperMock.file).toBeCalledTimes(1);
    });
});

describe(`${RPC}`, () =>
{
    it('should run middlewares', async function ()
    {
        const fakeURL = '/a/b.git/git-accaaaa';
        expect(RPC.test(fakeURL)).toBeTrue();
        await superagent.post(getFullURL(fakeURL));
        expect(MiddlewareWrapperMock.rpc).toBeCalledTimes(1);
    });
});