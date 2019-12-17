import {Git as GitService} from '../../../../Service';
import {IContext, IState} from '../../../Interface';
import {ParameterizedContext} from 'koa';
import {RouterContext} from '@koa/router';
import {ServiceResponse} from '../../../../Class';
import path from 'path';
import {Readable, Writable} from 'stream';

const ServiceMock = {
    Git: {
        file: jest.fn<ReturnType<typeof GitService.file>,
            Parameters<typeof GitService.file>>(),
        advertise: jest.fn<ReturnType<typeof GitService.advertise>,
            Parameters<typeof GitService.advertise>>(),
        rpc: jest.fn<ReturnType<typeof GitService.rpc>,
            Parameters<typeof GitService.rpc>>(),
    },
};

const nextMock = jest.fn();

describe('advertise', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Service', () => ServiceMock);
    });

    it('should handle nonexistent "service" parameter', async function ()
    {
        const fakeContext = {
            request: {
                query: {kafbfgkaefb: 'fgakeubgeaiough'}, // no "service" parameter
            },
            response: {
                status: 404,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const {advertise} = await import('../Middleware');
        await (advertise())(fakeContext, nextMock);
        expect(fakeContext.response.status).toBe(400);
        expect(fakeContext.state.serviceResponse).toEqual({});
        expect(ServiceMock.Git.advertise).not.toBeCalled();
    });

    it('should handle nonexistent querystring', async function ()
    {
        const fakeContext = {
            request: {
                query: {}, // no querystring
            },
            response: {
                status: 404,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const {advertise} = await import('../Middleware');
        await (advertise())(fakeContext, nextMock);
        expect(fakeContext.response.status).toBe(400);
        expect(fakeContext.state.serviceResponse).toEqual({});
        expect(ServiceMock.Git.advertise).not.toBeCalled();
    });

    it('should handle service', async function ()
    {
        const fakeService = 'aaegeagae';
        const fakeServiceResponse = new ServiceResponse<string>(200, {},
            'aegaegeagae');
        const fakeHeaders = {aegaeg: 'gaegeagae', bsrhhbrwshwr: 'shnrswhnsrh'};
        const fakeUsername = 'gaegaeg';
        const fakeRepositoryName = 'gaehswrhsrhd';
        const fakeContext = {
            request: {
                query: {service: fakeService}, // with "service" parameter
                headers: fakeHeaders,
            },
            params: [fakeUsername, fakeRepositoryName],
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        ServiceMock.Git.advertise.mockResolvedValue(fakeServiceResponse);
        const {advertise} = await import('../Middleware');
        await (advertise())(fakeContext, nextMock);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
        expect(ServiceMock.Git.advertise).toBeCalledTimes(1);
        expect(ServiceMock.Git.advertise).toBeCalledWith(
            {username: fakeUsername, name: fakeRepositoryName},
            fakeService, fakeHeaders);
    });
});

describe('file', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Service', () => ServiceMock);
    });

    it('should handle static file request', async function ()
    {
        const fakeUsername = 'geahsrhsrh';
        const fakeRepositoryName = 'gaehsrhrssrh';
        const fakeFilePath = path.join('gaegaeg', 'gaehsrhrs');
        const fakeHeaders = {
            gfaegaegaegae: 'bhgsehgserh',
            gagyatw4yhhsw: 'hshbsrhsrh',
        };
        const fakeContext = {
            request: {
                headers: fakeHeaders,
            },
            params: [fakeUsername, fakeRepositoryName, fakeFilePath],
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse(200, {},
            new Readable());
        ServiceMock.Git.file.mockResolvedValue(fakeServiceResponse);
        const {file} = await import('../Middleware');
        await (file())(fakeContext, nextMock);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
        expect(ServiceMock.Git.file).toBeCalledTimes(1);
        expect(ServiceMock.Git.file).toBeCalledWith(
            {username: fakeUsername, name: fakeRepositoryName},
            fakeFilePath, fakeHeaders);
    });
});

describe('rpc', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Service', () => ServiceMock);
    });

    it('should handle rpc request', async function ()
    {
        const fakeUsername = 'aegaegaegae';
        const fakeRepositoryName = 'gaegaegaeeagaegaeg';
        const fakeCommand = 'gaegaegaevvv';
        const fakeHeaders = {
            gaegaeg: 'gaegaegaeg',
            qw3ratgae: 'ghbahgahars',
        };
        const fakeReq = new Writable();
        const fakeContext = {
            request: {
                headers: fakeHeaders,
            },
            req: fakeReq,
            params: [fakeUsername, fakeRepositoryName, fakeCommand],
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse(200, {},
            new Readable());
        ServiceMock.Git.rpc.mockResolvedValue(fakeServiceResponse);
        const {rpc} = await import('../Middleware');
        await (rpc())(fakeContext, nextMock);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
        expect(ServiceMock.Git.rpc).toBeCalledTimes(1);
        expect(ServiceMock.Git.rpc).toBeCalledWith(
            {username: fakeUsername, name: fakeRepositoryName},
            fakeCommand, fakeHeaders, fakeReq);
    });
});