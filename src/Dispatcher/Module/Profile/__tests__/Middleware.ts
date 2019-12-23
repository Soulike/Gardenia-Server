import {Session as SessionFunction} from '../../../../Function';
import * as ParameterValidator from '../ParameterValidator';
import {Profile as ProfileService} from '../../../../Service';
import {IContext, IState} from '../../../Interface';
import {ParameterizedContext} from 'koa';
import {RouterContext} from '@koa/router';
import {Profile, ResponseBody, ServiceResponse} from '../../../../Class';
import {InvalidSessionError, WrongParameterError} from '../../../Class';
import {get, set} from '../Middleware';

const functionMock = {
    Session: {
        isSessionValid: jest.fn<ReturnType<typeof SessionFunction.isSessionValid>,
            Parameters<typeof SessionFunction.isSessionValid>>(),
    },
};

const parameterValidatorMock = {
    get: jest.fn<ReturnType<typeof ParameterValidator.get>, Parameters<typeof ParameterValidator.get>>(),
    set: jest.fn<ReturnType<typeof ParameterValidator.set>, Parameters<typeof ParameterValidator.set>>(),
    uploadAvatar: jest.fn<ReturnType<typeof ParameterValidator.uploadAvatar>, Parameters<typeof ParameterValidator.uploadAvatar>>(),
};

const serviceMock = {
    Profile: {
        get: jest.fn<ReturnType<typeof ProfileService.get>, Parameters<typeof ProfileService.get>>(),
        set: jest.fn<ReturnType<typeof ProfileService.set>, Parameters<typeof ProfileService.set>>(),
        uploadAvatar: jest.fn<ReturnType<typeof ProfileService.uploadAvatar>, Parameters<typeof ProfileService.uploadAvatar>>(),
    },
};

const nextMock = jest.fn();

describe(`${get}`, () =>
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
            account: {
                username: 'fafgafg',
            },
        };
        const fakeContext = {
            request: {body: fakeBody},
            state: <IState>{serviceResponse: {}},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.get.mockReturnValue(false);
        const {get} = await import('../Middleware');
        await expect((get())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.get).toBeCalledTimes(1);
        expect(parameterValidatorMock.get).toBeCalledWith(fakeBody);
        expect(serviceMock.Profile.get).not.toBeCalled();
        expect(fakeContext.state.serviceResponse).toEqual({});
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'fgaegeasg'};
        const fakeBody = {
            account: {
                username: 'fafgafg',
            },
        };
        const fakeContext = {
            session: fakeSession,
            request: {body: fakeBody},
            state: <IState>{serviceResponse: {}},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse(200, {},
            new ResponseBody(true, '',
                new Profile('fawfawf', 'geagaes', 'a@n.com', '')));
        parameterValidatorMock.get.mockReturnValue(true);
        serviceMock.Profile.get.mockResolvedValue(fakeServiceResponse);
        const {get} = await import('../Middleware');
        await (get())(fakeContext, nextMock);
        expect(parameterValidatorMock.get).toBeCalledTimes(1);
        expect(parameterValidatorMock.get).toBeCalledWith(fakeBody);
        expect(serviceMock.Profile.get).toBeCalledTimes(1);
        expect(serviceMock.Profile.get).toBeCalledWith(fakeSession, fakeBody.account);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`${set}`, () =>
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
        const fakeSession = {username: 'fgaegaegae'};
        const fakeBody = {
            email: 'a@b.com',
            nickname: 'gagaeg',
        };
        const fakeContext = {
            request: {body: fakeBody},
            state: <IState>{serviceResponse: {}},
            session: fakeSession,
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {set} = await import('../Middleware');
        await expect((set())(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.set).not.toBeCalled();
        expect(serviceMock.Profile.set).not.toBeCalled();
        expect(fakeContext.state.serviceResponse).toEqual({});
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {username: 'fgaegaegae'};
        const fakeBody = {
            email: 'a@b.com',
            nickname: 'gagaeg',
        };
        const fakeContext = {
            request: {body: fakeBody},
            state: <IState>{serviceResponse: {}},
            session: fakeSession,
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(true);
        parameterValidatorMock.set.mockReturnValue(false);
        const {set} = await import('../Middleware');
        await expect((set())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.set).toBeCalledTimes(1);
        expect(parameterValidatorMock.set).toBeCalledWith(fakeBody);
        expect(serviceMock.Profile.set).not.toBeCalled();
        expect(fakeContext.state.serviceResponse).toEqual({});
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'fgaegaegae'};
        const fakeBody = {
            email: 'a@b.com',
            nickname: 'gagaeg',
        };
        const fakeContext = {
            request: {body: fakeBody},
            state: <IState>{serviceResponse: {}},
            session: fakeSession,
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse<void>(200, {},
            new ResponseBody(true));
        functionMock.Session.isSessionValid.mockReturnValue(true);
        parameterValidatorMock.set.mockReturnValue(true);
        serviceMock.Profile.set.mockResolvedValue(fakeServiceResponse);
        const {set} = await import('../Middleware');
        await (set())(fakeContext, nextMock);
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.set).toBeCalledTimes(1);
        expect(parameterValidatorMock.set).toBeCalledWith(fakeBody);
        expect(serviceMock.Profile.set).toBeCalledTimes(1);
        expect(serviceMock.Profile.set).toBeCalledWith(fakeBody, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`uploadAvatar`, () =>
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
        const fakeSession = {username: 'fgaegaegae'};
        const fakeFiles = {
            avatar: {a: 'b'},
        };
        const fakeContext = {
            request: {files: fakeFiles},
            state: <IState>{serviceResponse: {}},
            session: fakeSession,
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {uploadAvatar} = await import('../Middleware');
        await expect((uploadAvatar())(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.uploadAvatar).not.toBeCalled();
        expect(serviceMock.Profile.uploadAvatar).not.toBeCalled();
        expect(fakeContext.state.serviceResponse).toEqual({});
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {username: 'fgaegaegae'};
        const fakeFiles = {
            avatar: {a: 'b'},
        };
        const fakeContext = {
            request: {files: fakeFiles},
            state: <IState>{serviceResponse: {}},
            session: fakeSession,
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(true);
        parameterValidatorMock.set.mockReturnValue(false);
        const {uploadAvatar} = await import('../Middleware');
        await expect((uploadAvatar())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.uploadAvatar).toBeCalledTimes(1);
        expect(parameterValidatorMock.uploadAvatar).toBeCalledWith(fakeFiles);
        expect(serviceMock.Profile.uploadAvatar).not.toBeCalled();
        expect(fakeContext.state.serviceResponse).toEqual({});
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'fgaegaegae'};
        const fakeFiles = {
            avatar: {a: 'b'},
        };
        const fakeContext = {
            request: {files: fakeFiles},
            state: <IState>{serviceResponse: {}},
            session: fakeSession,
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse<void>(200, {},
            new ResponseBody(true));
        functionMock.Session.isSessionValid.mockReturnValue(true);
        parameterValidatorMock.uploadAvatar.mockReturnValue(true);
        serviceMock.Profile.uploadAvatar.mockResolvedValue(fakeServiceResponse);
        const {uploadAvatar} = await import('../Middleware');
        await (uploadAvatar())(fakeContext, nextMock);
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.uploadAvatar).toBeCalledTimes(1);
        expect(parameterValidatorMock.uploadAvatar).toBeCalledWith(fakeFiles);
        expect(serviceMock.Profile.uploadAvatar).toBeCalledTimes(1);
        expect(serviceMock.Profile.uploadAvatar).toBeCalledWith(fakeFiles.avatar, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});