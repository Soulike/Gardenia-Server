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
    ADD_TO_GROUP,
    BRANCH,
    COMMIT_COUNT,
    DIRECTORY,
    FILE_INFO,
    GROUPS,
    LAST_COMMIT,
    RAW_FILE,
    REPOSITORY,
    SET_DESCRIPTION,
    SET_IS_PUBLIC,
    SET_NAME,
} from '../ROUTE';
import 'jest-extended';

const PORT = 34536;

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
    repository: jest.fn<ReturnType<typeof Middleware.repository>,
        Parameters<typeof Middleware.repository>>(),
    branch: jest.fn<ReturnType<typeof Middleware.branch>,
        Parameters<typeof Middleware.branch>>(),
    lastCommit: jest.fn<ReturnType<typeof Middleware.lastCommit>,
        Parameters<typeof Middleware.lastCommit>>(),
    directory: jest.fn<ReturnType<typeof Middleware.directory>,
        Parameters<typeof Middleware.directory>>(),
    commitCount: jest.fn<ReturnType<typeof Middleware.commitCount>,
        Parameters<typeof Middleware.commitCount>>(),
    fileInfo: jest.fn<ReturnType<typeof Middleware.fileInfo>,
        Parameters<typeof Middleware.fileInfo>>(),
    rawFile: jest.fn<ReturnType<typeof Middleware.rawFile>,
        Parameters<typeof Middleware.rawFile>>(),
    setName: jest.fn<ReturnType<typeof Middleware.setName>,
        Parameters<typeof Middleware.setName>>(),
    setDescription: jest.fn<ReturnType<typeof Middleware.setDescription>,
        Parameters<typeof Middleware.setDescription>>(),
    setIsPublic: jest.fn<ReturnType<typeof Middleware.setIsPublic>,
        Parameters<typeof Middleware.setIsPublic>>(),
    groups: jest.fn<ReturnType<typeof Middleware.groups>,
        Parameters<typeof Middleware.groups>>(),
    addToGroup: jest.fn<ReturnType<typeof Middleware.addToGroup>,
        Parameters<typeof Middleware.addToGroup>>(),
    commitHistoryBetweenCommits: jest.fn<ReturnType<typeof Middleware.commitHistoryBetweenCommits>,
        Parameters<typeof Middleware.commitHistoryBetweenCommits>>(),
    commitHistory: jest.fn<ReturnType<typeof Middleware.commitHistory>,
        Parameters<typeof Middleware.commitHistory>>(),
    fileCommitHistoryBetweenCommits: jest.fn<ReturnType<typeof Middleware.fileCommitHistoryBetweenCommits>,
        Parameters<typeof Middleware.fileCommitHistoryBetweenCommits>>(),
    fileCommitHistory: jest.fn<ReturnType<typeof Middleware.fileCommitHistory>,
        Parameters<typeof Middleware.fileCommitHistory>>(),
    diffBetweenCommits: jest.fn<ReturnType<typeof Middleware.diffBetweenCommits>,
        Parameters<typeof Middleware.diffBetweenCommits>>(),
    fileDiffBetweenCommits: jest.fn<ReturnType<typeof Middleware.fileDiffBetweenCommits>,
        Parameters<typeof Middleware.fileDiffBetweenCommits>>(),
    commit: jest.fn<ReturnType<typeof Middleware.commit>,
        Parameters<typeof Middleware.commit>>(),
    fileCommit: jest.fn<ReturnType<typeof Middleware.fileCommit>,
        Parameters<typeof Middleware.fileCommit>>(),
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

describe(`REPOSITORY`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(REPOSITORY));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.repository).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.repository);
    });
});

describe(`BRANCH`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(BRANCH));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.branch).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.branch);
    });
});

describe(`LAST_COMMIT`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(LAST_COMMIT));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.lastCommit).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.lastCommit);
    });
});

describe(`DIRECTORY`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(DIRECTORY));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.directory).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.directory);
    });
});

describe(`COMMIT_COUNT`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(COMMIT_COUNT));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.commitCount).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.commitCount);
    });
});

describe(`FILE_INFO`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(FILE_INFO));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.fileInfo).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.fileInfo);
    });
});

describe(`RAW_FILE`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(RAW_FILE));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.rawFile).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.rawFile);
    });
});

describe(`SET_NAME`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(SET_NAME));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.setName).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.setName);
    });
});

describe(`SET_DESCRIPTION`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(SET_DESCRIPTION));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.setDescription).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.setDescription);
    });
});

describe(`SET_IS_PUBLIC`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(SET_IS_PUBLIC));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.setIsPublic).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.setIsPublic);
    });
});

describe(`GROUPS`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.get(getFullURL(GROUPS));
        expect(JSONQuerystringParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.groups).toBeCalledTimes(1);
        expect(JSONQuerystringParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.groups);
    });
});

describe(`ADD_TO_GROUP`, () =>
{
    it('should run middlewares', async function ()
    {
        await superagent.post(getFullURL(ADD_TO_GROUP));
        expect(bodyParserMiddlewareMock).toBeCalledTimes(1);
        expect(MiddlewareWrapperMock.addToGroup).toBeCalledTimes(1);
        expect(bodyParserMock).toHaveBeenCalledBefore(MiddlewareWrapperMock.addToGroup);
    });
});