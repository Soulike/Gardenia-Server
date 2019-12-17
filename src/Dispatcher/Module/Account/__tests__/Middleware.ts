import * as ParameterValidator from '../ParameterValidator';
import {Account, Group, Profile, ResponseBody, ServiceResponse} from '../../../../Class';
import {ParameterizedContext} from 'koa';
import {IContext, IState} from '../../../Interface';
import {RouterContext} from '@koa/router';
import {InvalidSessionError, WrongParameterError} from '../../../Class';
import {Account as AccountService} from '../../../../Service';
import {Session as SessionFunction} from '../../../../Function';
import 'koa-body';
import 'jest-extended';

const ParameterValidatorMock = {
    login: jest.fn<ReturnType<typeof ParameterValidator.login>,
        Parameters<typeof ParameterValidator.login>>(),
    register: jest.fn<ReturnType<typeof ParameterValidator.register>,
        Parameters<typeof ParameterValidator.register>>(),
    getGroups: jest.fn<ReturnType<typeof ParameterValidator.getGroups>,
        Parameters<typeof ParameterValidator.getGroups>>(),
    getAdministratingGroups: jest.fn<ReturnType<typeof ParameterValidator.getAdministratingGroups>,
        Parameters<typeof ParameterValidator.getAdministratingGroups>>(),
    checkPassword: jest.fn<ReturnType<typeof ParameterValidator.checkPassword>,
        Parameters<typeof ParameterValidator.checkPassword>>(),
};

const ServiceMock = {
    Account: {
        login: jest.fn<ReturnType<typeof AccountService.login>,
            Parameters<typeof AccountService.login>>(),
        register: jest.fn<ReturnType<typeof AccountService.register>,
            Parameters<typeof AccountService.register>>(),
        checkSession: jest.fn<ReturnType<typeof AccountService.checkSession>,
            Parameters<typeof AccountService.checkSession>>(),
        logout: jest.fn<ReturnType<typeof AccountService.logout>,
            Parameters<typeof AccountService.logout>>(),
        getGroups: jest.fn<ReturnType<typeof AccountService.getGroups>,
            Parameters<typeof AccountService.getGroups>>(),
        getAdministratingGroups: jest.fn<ReturnType<typeof AccountService.getAdministratingGroups>,
            Parameters<typeof AccountService.getAdministratingGroups>>(),
        checkPassword: jest.fn<ReturnType<typeof AccountService.checkPassword>,
            Parameters<typeof AccountService.checkPassword>>(),
    },
};

const functionMock = {
    Session: {
        isSessionValid: jest.fn<ReturnType<typeof SessionFunction.isSessionValid>,
            Parameters<typeof SessionFunction.isSessionValid>>(),
    },
};

const nextMock = jest.fn();

describe('login', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.mock('../ParameterValidator', () => ParameterValidatorMock);
        jest.mock('../../../../Service', () => ServiceMock);
    });

    it('should validate body before calling service', async function ()
    {
        const fakeContext = {
            request: {
                body: new Account('fafaef', 'a'.repeat(64)),
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        ParameterValidatorMock.login.mockReturnValueOnce(false);
        const {login} = await import('../Middleware');
        await expect(login()(fakeContext, nextMock)).rejects.toBeInstanceOf(WrongParameterError);
        expect(ServiceMock.Account.login).not.toBeCalled();

        ParameterValidatorMock.login.mockReturnValueOnce(true);
        await expect(login()(fakeContext, nextMock)).toResolve();
        expect(ServiceMock.Account.login).toBeCalledTimes(1);
        expect(ServiceMock.Account.login).toHaveBeenCalledAfter(ParameterValidatorMock.login);
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeContext = {
            request: {
                body: new Account('fafaef', 'a'.repeat(64)),
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse: ServiceResponse<void> = new ServiceResponse(200, {});
        ParameterValidatorMock.login.mockReturnValue(true);
        ServiceMock.Account.login.mockResolvedValue(fakeServiceResponse);
        const {login} = await import('../Middleware');
        await login()(fakeContext, nextMock);
        expect(ServiceMock.Account.login).toBeCalledTimes(1);
        expect(ServiceMock.Account.login).toBeCalledWith(fakeContext.request.body);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('register', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.mock('../ParameterValidator', () => ParameterValidatorMock);
        jest.mock('../../../../Service', () => ServiceMock);
    });

    it('should validate body before calling service', async function ()
    {
        const fakeContext = {
            request: {
                body: {
                    account: new Account('fafaef', 'a'.repeat(64)),
                    profile: <Omit<Profile, 'username'>>{nickname: 'fafaf', email: 'a@b.com', avatar: ''},
                },
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        ParameterValidatorMock.register.mockReturnValueOnce(false);
        const {register} = await import('../Middleware');
        await expect(register()(fakeContext, nextMock)).rejects.toBeInstanceOf(WrongParameterError);
        expect(ServiceMock.Account.register).not.toBeCalled();

        ParameterValidatorMock.register.mockReturnValueOnce(true);
        await expect(register()(fakeContext, nextMock)).toResolve();
        expect(ServiceMock.Account.register).toBeCalledTimes(1);
        expect(ServiceMock.Account.register).toHaveBeenCalledAfter(ParameterValidatorMock.register);
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeContext = {
            request: {
                body: {
                    account: new Account('fafaef', 'a'.repeat(64)),
                    profile: <Omit<Profile, 'username'>>{nickname: 'fafaf', email: 'a@b.com', avatar: ''},
                },
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse: ServiceResponse<void> = new ServiceResponse(200, {});
        ParameterValidatorMock.register.mockReturnValue(true);
        ServiceMock.Account.register.mockResolvedValue(fakeServiceResponse);
        const {register} = await import('../Middleware');
        await register()(fakeContext, nextMock);
        expect(ServiceMock.Account.register).toBeCalledTimes(1);
        const {account, profile} = fakeContext.request.body;
        expect(ServiceMock.Account.register).toBeCalledWith(account, profile);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('checkSession', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.mock('../../../../Service', () => ServiceMock);
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeContext = {
            request: {
                body: {},
            },
            state: <IState>{
                serviceResponse: {},
            },
            session: {a: 'b'},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse: ServiceResponse<{ isValid: boolean }> = new ServiceResponse(200, {},
            new ResponseBody(true, '', {isValid: true}));
        ServiceMock.Account.checkSession.mockResolvedValue(fakeServiceResponse);
        const {checkSession} = await import('../Middleware');
        await checkSession()(fakeContext, nextMock);
        expect(ServiceMock.Account.checkSession).toBeCalledTimes(1);
        expect(ServiceMock.Account.checkSession).toBeCalledWith(fakeContext.session);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('checkPassword', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../ParameterValidator', () => ParameterValidatorMock);
        jest.mock('../../../../Service', () => ServiceMock);
        jest.mock('../../../../Function', () => functionMock);
    });

    it('should check session before calling service', async function ()
    {
        const fakeSession = {fafaef: 'faefgaefg'};
        const fakeContext = {
            session: fakeSession,
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {checkPassword} = await import('../Middleware');
        await expect(checkPassword()(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(ParameterValidatorMock.checkPassword).not.toBeCalled();
        expect(ServiceMock.Account.checkPassword).not.toBeCalled();
    });

    it('should validate body before calling service', async function ()
    {
        const fakeSession = {fafaef: 'faefgaefg'};
        const fakeBody: Pick<Account, 'hash'> = {
            hash: 'a'.repeat(64),
        };
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
            session: fakeSession,
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(true);
        ParameterValidatorMock.checkPassword.mockReturnValue(false);
        const {checkPassword} = await import('../Middleware');
        await expect(checkPassword()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(ParameterValidatorMock.checkPassword).toBeCalledTimes(1);
        expect(ParameterValidatorMock.checkPassword).toBeCalledWith(fakeBody);
        expect(ServiceMock.Account.checkPassword).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {fafaef: 'faefgaefg'};
        const fakeBody: Pick<Account, 'hash'> = {
            hash: 'a'.repeat(64),
        };
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
            session: fakeSession,
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse: ServiceResponse<{ isCorrect: boolean }> = new ServiceResponse(200, {},
            new ResponseBody(true, '', {isCorrect: true}));
        functionMock.Session.isSessionValid.mockReturnValue(true);
        ParameterValidatorMock.checkPassword.mockReturnValue(true);
        ServiceMock.Account.checkPassword.mockResolvedValue(fakeServiceResponse);
        const {checkPassword} = await import('../Middleware');
        await checkPassword()(fakeContext, nextMock);
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(ServiceMock.Account.checkPassword).toBeCalledTimes(1);
        expect(ServiceMock.Account.checkPassword).toBeCalledWith(fakeBody, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('logout', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.mock('../../../../Service', () => ServiceMock);
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeContext = {
            request: {
                body: {},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true), {username: undefined});
        ServiceMock.Account.logout.mockResolvedValue(fakeServiceResponse);
        const {logout} = await import('../Middleware');
        await logout()(fakeContext, nextMock);
        expect(ServiceMock.Account.logout).toBeCalledTimes(1);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('getGroups', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../ParameterValidator', () => ParameterValidatorMock);
        jest.mock('../../../../Service', () => ServiceMock);
    });

    it('should validate body before calling service', async function ()
    {
        const fakeContext = {
            request: {
                body: <Pick<Account, 'username'>>{username: 'dfafaefae'},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        ParameterValidatorMock.getGroups.mockReturnValueOnce(false);
        const {getGroups} = await import('../Middleware');
        await expect(getGroups()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(ServiceMock.Account.getGroups).not.toBeCalled();

        ParameterValidatorMock.getGroups.mockReturnValueOnce(true);
        await expect(getGroups()(fakeContext, nextMock)).toResolve();
        expect(ServiceMock.Account.getGroups).toBeCalledTimes(1);
        expect(ServiceMock.Account.getGroups).toHaveBeenCalledAfter(ParameterValidatorMock.getGroups);
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeContext = {
            request: {
                body: <Pick<Account, 'username'>>{username: 'dfafaefae'},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse(200, {}, [
            new Group(1, 'fafae'),
            new Group(2, 'geagsgea'),
        ]);
        ParameterValidatorMock.getGroups.mockReturnValue(true);
        ServiceMock.Account.getGroups.mockResolvedValue(fakeServiceResponse);
        const {getGroups} = await import('../Middleware');
        await getGroups()(fakeContext, nextMock);
        expect(ServiceMock.Account.getGroups).toBeCalledTimes(1);
        expect(ServiceMock.Account.getGroups).toBeCalledWith(fakeContext.request.body);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('getAdministratingGroups', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.mock('../ParameterValidator', () => ParameterValidatorMock);
        jest.mock('../../../../Service', () => ServiceMock);
    });

    it('should validate body before calling service', async function ()
    {
        const fakeContext = {
            request: {
                body: <Pick<Account, 'username'>>{username: 'dfafaefae'},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        ParameterValidatorMock.getAdministratingGroups.mockReturnValueOnce(false);
        const {getAdministratingGroups} = await import('../Middleware');
        await expect(getAdministratingGroups()(fakeContext, nextMock)).rejects
            .toEqual(new WrongParameterError());
        expect(ServiceMock.Account.getAdministratingGroups).not.toBeCalled();

        ParameterValidatorMock.getAdministratingGroups.mockReturnValueOnce(true);
        await expect(getAdministratingGroups()(fakeContext, nextMock)).toResolve();
        expect(ServiceMock.Account.getAdministratingGroups).toBeCalledTimes(1);
        expect(ServiceMock.Account.getAdministratingGroups)
            .toHaveBeenCalledAfter(ParameterValidatorMock.getAdministratingGroups);
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeContext = {
            request: {
                body: <Pick<Account, 'username'>>{username: 'dfafaefae'},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse(200, {}, [
            new Group(1, 'fafae'),
            new Group(2, 'geagsgea'),
        ]);
        ParameterValidatorMock.getAdministratingGroups.mockReturnValue(true);
        ServiceMock.Account.getAdministratingGroups.mockResolvedValue(fakeServiceResponse);
        const {getAdministratingGroups} = await import('../Middleware');
        await getAdministratingGroups()(fakeContext, nextMock);
        expect(ServiceMock.Account.getAdministratingGroups).toBeCalledTimes(1);
        expect(ServiceMock.Account.getAdministratingGroups).toBeCalledWith(fakeContext.request.body);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});