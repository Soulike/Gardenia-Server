import {Session as SessionFunction} from '../../../../Function';
import * as ParameterValidator from '../ParameterValidator';
import {Repository as RepositoryService} from '../../../../Service';
import {ParameterizedContext} from 'koa';
import {IContext, IState} from '../../../Interface';
import {RouterContext} from '@koa/router';
import {InvalidSessionError, WrongParameterError} from '../../../Class';
import {Repository, ResponseBody, ServiceResponse} from '../../../../Class';

const functionMock = {
    Session: {
        isSessionValid: jest.fn<ReturnType<typeof SessionFunction.isSessionValid>,
            Parameters<typeof SessionFunction.isSessionValid>>(),
    },
};

const parameterValidatorMock = {
    getRepositories: jest.fn<ReturnType<typeof ParameterValidator.getRepositories>, Parameters<typeof ParameterValidator.getRepositories>>(),
    create: jest.fn<ReturnType<typeof ParameterValidator.create>, Parameters<typeof ParameterValidator.create>>(),
    del: jest.fn<ReturnType<typeof ParameterValidator.del>, Parameters<typeof ParameterValidator.del>>(),
};

const serviceMock = {
    Repository: {
        getRepositories: jest.fn<ReturnType<typeof RepositoryService.getRepositories>, Parameters<typeof RepositoryService.getRepositories>>(),
        create: jest.fn<ReturnType<typeof RepositoryService.create>, Parameters<typeof RepositoryService.create>>(),
        del: jest.fn<ReturnType<typeof RepositoryService.del>, Parameters<typeof RepositoryService.del>>(),
    },
};

const nextMock = jest.fn();

describe(`getRepositories`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Function', () => functionMock);
        jest.mock('../../../../Service', () => serviceMock);
        jest.mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate parameter', async function ()
    {
        const fakeBody = {
            start: 1,
            end: 2,
            username: 'fagfae',
        };
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.getRepositories.mockReturnValue(false);
        const {getRepositories} = await import('../Middleware');
        await expect((getRepositories())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.getRepositories).toBeCalledTimes(1);
        expect(parameterValidatorMock.getRepositories).toBeCalledWith(fakeBody);
        expect(serviceMock.Repository.getRepositories).not.toBeCalled();
        expect(fakeContext.state.serviceResponse).toEqual({});
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeBody = {
            start: 1,
            end: 2,
            username: 'fagfae',
        };
        const fakeSession = {username: 'fafawe'};
        const fakeServiceResponse = new ServiceResponse<Repository[]>(200, {},
            new ResponseBody(true, '',
                [new Repository('', '', '', true)]));
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
            session: fakeSession,
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.getRepositories.mockReturnValue(true);
        serviceMock.Repository.getRepositories.mockResolvedValue(fakeServiceResponse);
        const {getRepositories} = await import('../Middleware');
        await (getRepositories())(fakeContext, nextMock);
        expect(parameterValidatorMock.getRepositories).toBeCalledTimes(1);
        expect(parameterValidatorMock.getRepositories).toBeCalledWith(fakeBody);
        expect(serviceMock.Repository.getRepositories).toBeCalledTimes(1);
        expect(serviceMock.Repository.getRepositories).toBeCalledWith(
            fakeBody.start, fakeBody.end, fakeSession, fakeBody.username);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`create`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Function', () => functionMock);
        jest.mock('../../../../Service', () => serviceMock);
        jest.mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate session', async function ()
    {
        const fakeSession = {usernameL: 'faegae'};
        const fakeContext = {
            session: fakeSession,
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {create} = await import('../Middleware');
        await expect(create()(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.create).not.toBeCalled();
        expect(serviceMock.Repository.create).not.toBeCalled();
        expect(fakeContext.state.serviceResponse).toEqual({});
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {usernameL: 'faegae'};
        const fakeBody: Omit<Repository, 'username'> = {
            name: '', isPublic: false, description: '',
        };
        const fakeContext = {
            session: fakeSession,
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(true);
        parameterValidatorMock.create.mockReturnValue(false);
        const {create} = await import('../Middleware');
        await expect(create()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.create).toBeCalledTimes(1);
        expect(parameterValidatorMock.create).toBeCalledWith(fakeBody);
        expect(serviceMock.Repository.create).not.toBeCalled();
        expect(fakeContext.state.serviceResponse).toEqual({});
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {usernameL: 'faegae'};
        const fakeBody: Omit<Repository, 'username'> = {
            name: '', isPublic: false, description: '',
        };
        const fakeServiceResponse = new ServiceResponse<void>(200, {},
            new ResponseBody(true));
        const fakeContext = {
            session: fakeSession,
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(true);
        parameterValidatorMock.create.mockReturnValue(true);
        serviceMock.Repository.create.mockResolvedValue(fakeServiceResponse);
        const {create} = await import('../Middleware');
        await create()(fakeContext, nextMock);
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.create).toBeCalledTimes(1);
        expect(parameterValidatorMock.create).toBeCalledWith(fakeBody);
        expect(serviceMock.Repository.create).toBeCalledTimes(1);
        expect(serviceMock.Repository.create).toBeCalledWith(fakeBody, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`del`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Function', () => functionMock);
        jest.mock('../../../../Service', () => serviceMock);
        jest.mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate session', async function ()
    {
        const fakeSession = {usernameL: 'faegae'};
        const fakeContext = {
            session: fakeSession,
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {del} = await import('../Middleware');
        await expect(del()(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.del).not.toBeCalled();
        expect(serviceMock.Repository.del).not.toBeCalled();
        expect(fakeContext.state.serviceResponse).toEqual({});
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {usernameL: 'faegae'};
        const fakeBody: Pick<Repository, 'name'> = {name: ''};
        const fakeContext = {
            session: fakeSession,
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(true);
        parameterValidatorMock.del.mockReturnValue(false);
        const {del} = await import('../Middleware');
        await expect(del()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.del).toBeCalledTimes(1);
        expect(parameterValidatorMock.del).toBeCalledWith(fakeBody);
        expect(serviceMock.Repository.del).not.toBeCalled();
        expect(fakeContext.state.serviceResponse).toEqual({});
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {usernameL: 'faegae'};
        const fakeBody: Pick<Repository, 'name'> = {name: ''};
        const fakeServiceResponse = new ServiceResponse<void>(200, {},
            new ResponseBody(true));
        const fakeContext = {
            session: fakeSession,
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(true);
        parameterValidatorMock.del.mockReturnValue(true);
        serviceMock.Repository.del.mockResolvedValue(fakeServiceResponse);
        const {del} = await import('../Middleware');
        await del()(fakeContext, nextMock);
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.del).toBeCalledTimes(1);
        expect(parameterValidatorMock.del).toBeCalledWith(fakeBody);
        expect(serviceMock.Repository.del).toBeCalledTimes(1);
        expect(serviceMock.Repository.del).toBeCalledWith(fakeBody, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});