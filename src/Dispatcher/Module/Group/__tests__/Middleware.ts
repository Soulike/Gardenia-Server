import {Session as SessionFunction} from '../../../../Function';
import * as ParameterValidator from '../ParameterValidator';
import {Group as GroupService} from '../../../../Service';
import {ParameterizedContext} from 'koa';
import {IContext, IState} from '../../../Interface';
import {RouterContext} from '@koa/router';
import {Session} from 'koa-session';
import {InvalidSessionError, WrongParameterError} from '../../../Class';
import {Account, Group, Repository, ResponseBody, ServiceResponse} from '../../../../Class';

const functionMock = {
    Session: {
        isSessionValid: jest.fn<ReturnType<typeof SessionFunction.isSessionValid>,
            Parameters<typeof SessionFunction.isSessionValid>>(),
    },
};

const parameterValidatorMock = {
    add: jest.fn<ReturnType<typeof ParameterValidator.add>,
        Parameters<typeof ParameterValidator.add>>(),
    dismiss: jest.fn<ReturnType<typeof ParameterValidator.dismiss>,
        Parameters<typeof ParameterValidator.dismiss>>(),
    info: jest.fn<ReturnType<typeof ParameterValidator.info>,
        Parameters<typeof ParameterValidator.info>>(),
    accounts: jest.fn<ReturnType<typeof ParameterValidator.accounts>,
        Parameters<typeof ParameterValidator.accounts>>(),
    addAccounts: jest.fn<ReturnType<typeof ParameterValidator.addAccounts>,
        Parameters<typeof ParameterValidator.addAccounts>>(),
    removeAccounts: jest.fn<ReturnType<typeof ParameterValidator.removeAccounts>,
        Parameters<typeof ParameterValidator.removeAccounts>>(),
    admins: jest.fn<ReturnType<typeof ParameterValidator.admins>,
        Parameters<typeof ParameterValidator.admins>>(),
    addAdmins: jest.fn<ReturnType<typeof ParameterValidator.addAdmins>,
        Parameters<typeof ParameterValidator.addAdmins>>(),
    removeAdmins: jest.fn<ReturnType<typeof ParameterValidator.removeAdmins>,
        Parameters<typeof ParameterValidator.removeAdmins>>(),
    isAdmin: jest.fn<ReturnType<typeof ParameterValidator.isAdmin>,
        Parameters<typeof ParameterValidator.isAdmin>>(),
    repositories: jest.fn<ReturnType<typeof ParameterValidator.repositories>,
        Parameters<typeof ParameterValidator.repositories>>(),
    removeRepositories: jest.fn<ReturnType<typeof ParameterValidator.removeRepositories>,
        Parameters<typeof ParameterValidator.removeRepositories>>(),
};

const serviceMock = {
    Group: {
        add: jest.fn<ReturnType<typeof GroupService.add>,
            Parameters<typeof GroupService.add>>(),
        dismiss: jest.fn<ReturnType<typeof GroupService.dismiss>,
            Parameters<typeof GroupService.dismiss>>(),
        info: jest.fn<ReturnType<typeof GroupService.info>,
            Parameters<typeof GroupService.info>>(),
        accounts: jest.fn<ReturnType<typeof GroupService.accounts>,
            Parameters<typeof GroupService.accounts>>(),
        addAccounts: jest.fn<ReturnType<typeof GroupService.addAccounts>,
            Parameters<typeof GroupService.addAccounts>>(),
        removeAccounts: jest.fn<ReturnType<typeof GroupService.removeAccounts>,
            Parameters<typeof GroupService.removeAccounts>>(),
        admins: jest.fn<ReturnType<typeof GroupService.admins>,
            Parameters<typeof GroupService.admins>>(),
        addAdmins: jest.fn<ReturnType<typeof GroupService.addAdmins>,
            Parameters<typeof GroupService.addAdmins>>(),
        removeAdmins: jest.fn<ReturnType<typeof GroupService.removeAdmins>,
            Parameters<typeof GroupService.removeAdmins>>(),
        isAdmin: jest.fn<ReturnType<typeof GroupService.isAdmin>,
            Parameters<typeof GroupService.isAdmin>>(),
        repositories: jest.fn<ReturnType<typeof GroupService.repositories>,
            Parameters<typeof GroupService.repositories>>(),
        removeRepositories: jest.fn<ReturnType<typeof GroupService.removeRepositories>,
            Parameters<typeof GroupService.removeRepositories>>(),
    },
};

const nextMock = jest.fn();

describe(`add`, () =>
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
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeContext = {
            session: fakeSession,
            request: {
                body: {},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {add} = await import('../Middleware');
        await expect((add())(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.add).not.toBeCalled();
        expect(serviceMock.Group.add).not.toBeCalled();
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {name: 'gaehrsahsr'};
        const fakeBody = {
            group: fakeGroup,
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
        parameterValidatorMock.add.mockReturnValue(false);
        const {add} = await import('../Middleware');
        await expect((add())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.add).toBeCalledTimes(1);
        expect(parameterValidatorMock.add).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.add).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {name: 'fafgaegae'};
        const fakeBody = {
            group: fakeGroup,
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
        parameterValidatorMock.add.mockReturnValue(true);
        serviceMock.Group.add.mockResolvedValue(fakeServiceResponse);
        const {add} = await import('../Middleware');
        await (add()(fakeContext, nextMock));
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.add).toBeCalledTimes(1);
        expect(parameterValidatorMock.add).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.add).toBeCalledTimes(1);
        expect(serviceMock.Group.add).toBeCalledWith(fakeGroup, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`dismiss`, () =>
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
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeContext = {
            session: fakeSession,
            request: {
                body: {},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {dismiss} = await import('../Middleware');
        await expect((dismiss())(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.dismiss).not.toBeCalled();
        expect(serviceMock.Group.dismiss).not.toBeCalled();
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {name: 'gaegaehgbeashb'};
        const fakeBody = {
            group: fakeGroup,
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
        parameterValidatorMock.dismiss.mockReturnValue(false);
        const {dismiss} = await import('../Middleware');
        await expect((dismiss())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.dismiss).toBeCalledTimes(1);
        expect(parameterValidatorMock.dismiss).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.dismiss).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {name: 'fgaegaegae'};
        const fakeBody = {
            group: fakeGroup,
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
        parameterValidatorMock.dismiss.mockReturnValue(true);
        serviceMock.Group.dismiss.mockResolvedValue(fakeServiceResponse);
        const {dismiss} = await import('../Middleware');
        await (dismiss()(fakeContext, nextMock));
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.dismiss).toBeCalledTimes(1);
        expect(parameterValidatorMock.dismiss).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.dismiss).toBeCalledTimes(1);
        expect(serviceMock.Group.dismiss).toBeCalledWith(fakeGroup, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`info`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Service', () => serviceMock);
        jest.mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate parameter', async function ()
    {
        const fakeGroup = {id: 10086};
        const fakeBody = {
            group: fakeGroup,
        };
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.info.mockReturnValue(false);
        const {info} = await import('../Middleware');
        await expect((info())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.info).toBeCalledTimes(1);
        expect(parameterValidatorMock.info).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.info).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeGroup = {id: 10010};
        const fakeBody = {
            group: fakeGroup,
        };
        const fakeServiceResponse = new ServiceResponse<Group>(200, {},
            new ResponseBody(true, '', new Group(50, 'aegaegeas')));
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.info.mockReturnValue(true);
        serviceMock.Group.info.mockResolvedValue(fakeServiceResponse);
        const {info} = await import('../Middleware');
        await (info()(fakeContext, nextMock));
        expect(parameterValidatorMock.info).toBeCalledTimes(1);
        expect(parameterValidatorMock.info).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.info).toBeCalledTimes(1);
        expect(serviceMock.Group.info).toBeCalledWith(fakeGroup);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`accounts`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Service', () => serviceMock);
        jest.mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate parameter', async function ()
    {
        const fakeGroup = {id: 10086};
        const fakeBody = {
            group: fakeGroup,
        };
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.accounts.mockReturnValue(false);
        const {accounts} = await import('../Middleware');
        await expect((accounts())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.accounts).toBeCalledTimes(1);
        expect(parameterValidatorMock.accounts).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.accounts).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeGroup = {id: 10010};
        const fakeBody = {
            group: fakeGroup,
        };
        const fakeServiceResponse = new ServiceResponse<Account[]>(200, {},
            new ResponseBody(true, '', [new Account('fdafaef', 'a'.repeat(64))]));
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.accounts.mockReturnValue(true);
        serviceMock.Group.accounts.mockResolvedValue(fakeServiceResponse);
        const {accounts} = await import('../Middleware');
        await (accounts()(fakeContext, nextMock));
        expect(parameterValidatorMock.accounts).toBeCalledTimes(1);
        expect(parameterValidatorMock.accounts).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.accounts).toBeCalledTimes(1);
        expect(serviceMock.Group.accounts).toBeCalledWith(fakeGroup);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`addAccounts`, () =>
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
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeContext = {
            session: fakeSession,
            request: {
                body: {},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {addAccounts} = await import('../Middleware');
        await expect((addAccounts())(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.addAccounts).not.toBeCalled();
        expect(serviceMock.Group.addAccounts).not.toBeCalled();
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {id: 10086};
        const fakeUsernames = ['gaegaegae', 'gaehaehae'];
        const fakeBody = {
            group: fakeGroup,
            usernames: fakeUsernames,
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
        parameterValidatorMock.addAccounts.mockReturnValue(false);
        const {addAccounts} = await import('../Middleware');
        await expect((addAccounts())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.addAccounts).toBeCalledTimes(1);
        expect(parameterValidatorMock.addAccounts).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.addAccounts).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {id: 10010};
        const fakeUsernames = ['gaegaegae', 'gaehaehae'];
        const fakeBody = {
            group: fakeGroup,
            usernames: fakeUsernames,
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
        parameterValidatorMock.addAccounts.mockReturnValue(true);
        serviceMock.Group.addAccounts.mockResolvedValue(fakeServiceResponse);
        const {addAccounts} = await import('../Middleware');
        await (addAccounts()(fakeContext, nextMock));
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.addAccounts).toBeCalledTimes(1);
        expect(parameterValidatorMock.addAccounts).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.addAccounts).toBeCalledTimes(1);
        expect(serviceMock.Group.addAccounts).toBeCalledWith(fakeGroup, fakeUsernames, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`removeAccounts`, () =>
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
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeContext = {
            session: fakeSession,
            request: {
                body: {},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {removeAccounts} = await import('../Middleware');
        await expect((removeAccounts())(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.removeAccounts).not.toBeCalled();
        expect(serviceMock.Group.removeAccounts).not.toBeCalled();
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {id: 10086};
        const fakeUsernames = ['gaegaegae', 'gaehaehae'];
        const fakeBody = {
            group: fakeGroup,
            usernames: fakeUsernames,
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
        parameterValidatorMock.removeAccounts.mockReturnValue(false);
        const {removeAccounts} = await import('../Middleware');
        await expect((removeAccounts())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.removeAccounts).toBeCalledTimes(1);
        expect(parameterValidatorMock.removeAccounts).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.removeAccounts).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {id: 10010};
        const fakeUsernames = ['gaegaegae', 'gaehaehae'];
        const fakeBody = {
            group: fakeGroup,
            usernames: fakeUsernames,
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
        parameterValidatorMock.removeAccounts.mockReturnValue(true);
        serviceMock.Group.removeAccounts.mockResolvedValue(fakeServiceResponse);
        const {removeAccounts} = await import('../Middleware');
        await (removeAccounts()(fakeContext, nextMock));
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.removeAccounts).toBeCalledTimes(1);
        expect(parameterValidatorMock.removeAccounts).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.removeAccounts).toBeCalledTimes(1);
        expect(serviceMock.Group.removeAccounts).toBeCalledWith(fakeGroup, fakeUsernames, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`admins`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Service', () => serviceMock);
        jest.mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate parameter', async function ()
    {
        const fakeGroup = {id: 10086};
        const fakeBody = {
            group: fakeGroup,
        };
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.accounts.mockReturnValue(false);
        const {admins} = await import('../Middleware');
        await expect((admins())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.admins).toBeCalledTimes(1);
        expect(parameterValidatorMock.admins).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.admins).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeGroup = {id: 10010};
        const fakeBody = {
            group: fakeGroup,
        };
        const fakeServiceResponse = new ServiceResponse<Account[]>(200, {},
            new ResponseBody(true, '', [new Account('fdafaef', 'a'.repeat(64))]));
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.admins.mockReturnValue(true);
        serviceMock.Group.admins.mockResolvedValue(fakeServiceResponse);
        const {admins} = await import('../Middleware');
        await (admins()(fakeContext, nextMock));
        expect(parameterValidatorMock.admins).toBeCalledTimes(1);
        expect(parameterValidatorMock.admins).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.admins).toBeCalledTimes(1);
        expect(serviceMock.Group.admins).toBeCalledWith(fakeGroup);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`addAdmins`, () =>
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
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeContext = {
            session: fakeSession,
            request: {
                body: {},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {addAdmins} = await import('../Middleware');
        await expect((addAdmins())(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.addAdmins).not.toBeCalled();
        expect(serviceMock.Group.addAdmins).not.toBeCalled();
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {id: 10086};
        const fakeUsernames = ['gaegaegae', 'gaehaehae'];
        const fakeBody = {
            group: fakeGroup,
            usernames: fakeUsernames,
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
        parameterValidatorMock.addAdmins.mockReturnValue(false);
        const {addAdmins} = await import('../Middleware');
        await expect((addAdmins())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.addAdmins).toBeCalledTimes(1);
        expect(parameterValidatorMock.addAdmins).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.addAdmins).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {id: 10010};
        const fakeUsernames = ['gaegaegae', 'gaehaehae'];
        const fakeBody = {
            group: fakeGroup,
            usernames: fakeUsernames,
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
        parameterValidatorMock.addAdmins.mockReturnValue(true);
        serviceMock.Group.addAdmins.mockResolvedValue(fakeServiceResponse);
        const {addAdmins} = await import('../Middleware');
        await (addAdmins()(fakeContext, nextMock));
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.addAdmins).toBeCalledTimes(1);
        expect(parameterValidatorMock.addAdmins).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.addAdmins).toBeCalledTimes(1);
        expect(serviceMock.Group.addAdmins).toBeCalledWith(fakeGroup, fakeUsernames, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`removeAdmins`, () =>
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
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeContext = {
            session: fakeSession,
            request: {
                body: {},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {removeAdmins} = await import('../Middleware');
        await expect((removeAdmins())(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.removeAdmins).not.toBeCalled();
        expect(serviceMock.Group.removeAdmins).not.toBeCalled();
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {id: 10086};
        const fakeUsernames = ['gaegaegae', 'gaehaehae'];
        const fakeBody = {
            group: fakeGroup,
            usernames: fakeUsernames,
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
        parameterValidatorMock.removeAdmins.mockReturnValue(false);
        const {removeAdmins} = await import('../Middleware');
        await expect((removeAdmins())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.removeAdmins).toBeCalledTimes(1);
        expect(parameterValidatorMock.removeAdmins).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.removeAdmins).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {id: 10010};
        const fakeUsernames = ['gaegaegae', 'gaehaehae'];
        const fakeBody = {
            group: fakeGroup,
            usernames: fakeUsernames,
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
        parameterValidatorMock.removeAdmins.mockReturnValue(true);
        serviceMock.Group.removeAdmins.mockResolvedValue(fakeServiceResponse);
        const {removeAdmins} = await import('../Middleware');
        await (removeAdmins()(fakeContext, nextMock));
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.removeAdmins).toBeCalledTimes(1);
        expect(parameterValidatorMock.removeAdmins).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.removeAdmins).toBeCalledTimes(1);
        expect(serviceMock.Group.removeAdmins).toBeCalledWith(fakeGroup, fakeUsernames, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`isAdmin`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Service', () => serviceMock);
        jest.mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {username: 'gagaegaeg'};
        const fakeGroup = {id: 10086};
        const fakeBody = {
            group: fakeGroup,
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
        parameterValidatorMock.isAdmin.mockReturnValue(false);
        const {isAdmin} = await import('../Middleware');
        await expect((isAdmin())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.isAdmin).toBeCalledTimes(1);
        expect(parameterValidatorMock.isAdmin).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.isAdmin).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'gagaegaeg'};
        const fakeGroup = {id: 10010};
        const fakeBody = {
            group: fakeGroup,
        };
        const fakeServiceResponse = new ServiceResponse(200, {},
            new ResponseBody(true, '', {isAdmin: true}));
        const fakeContext = {
            session: fakeSession,
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.isAdmin.mockReturnValue(true);
        serviceMock.Group.isAdmin.mockResolvedValue(fakeServiceResponse);
        const {isAdmin} = await import('../Middleware');
        await (isAdmin()(fakeContext, nextMock));
        expect(parameterValidatorMock.isAdmin).toBeCalledTimes(1);
        expect(parameterValidatorMock.isAdmin).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.isAdmin).toBeCalledTimes(1);
        expect(serviceMock.Group.isAdmin).toBeCalledWith(fakeGroup, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`repositories`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Service', () => serviceMock);
        jest.mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate parameter', async function ()
    {
        const fakeGroup = {id: 10086};
        const fakeBody = {
            group: fakeGroup,
        };
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.repositories.mockReturnValue(false);
        const {repositories} = await import('../Middleware');
        await expect((repositories())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.repositories).toBeCalledTimes(1);
        expect(parameterValidatorMock.repositories).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.repositories).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeGroup = {id: 10010};
        const fakeBody = {
            group: fakeGroup,
        };
        const fakeServiceResponse = new ServiceResponse<Repository[]>(200, {},
            new ResponseBody(true, '',
                [new Repository('faaef', 'gfagae', 'gagea', true)]));
        const fakeContext = {
            request: {
                body: fakeBody,
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        parameterValidatorMock.repositories.mockReturnValue(true);
        serviceMock.Group.repositories.mockResolvedValue(fakeServiceResponse);
        const {repositories} = await import('../Middleware');
        await (repositories()(fakeContext, nextMock));
        expect(parameterValidatorMock.repositories).toBeCalledTimes(1);
        expect(parameterValidatorMock.repositories).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.repositories).toBeCalledTimes(1);
        expect(serviceMock.Group.repositories).toBeCalledWith(fakeGroup);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe(`removeRepositories`, () =>
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
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeContext = {
            session: fakeSession,
            request: {
                body: {},
            },
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        functionMock.Session.isSessionValid.mockReturnValue(false);
        const {removeRepositories} = await import('../Middleware');
        await expect((removeRepositories())(fakeContext, nextMock)).rejects.toEqual(new InvalidSessionError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.removeRepositories).not.toBeCalled();
        expect(serviceMock.Group.removeRepositories).not.toBeCalled();
    });

    it('should validate parameter', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {id: 10086};
        const fakeRepositories = [{username: 'fafgae', name: 'gshsrh'}];
        const fakeBody = {
            group: fakeGroup,
            repositories: fakeRepositories,
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
        parameterValidatorMock.removeRepositories.mockReturnValue(false);
        const {removeRepositories} = await import('../Middleware');
        await expect((removeRepositories())(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.removeRepositories).toBeCalledTimes(1);
        expect(parameterValidatorMock.removeRepositories).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.removeRepositories).not.toBeCalled();
    });

    it('should call service and set ctx.state.serviceResponse', async function ()
    {
        const fakeSession = {username: 'awfaefgaeg'} as unknown as Session;
        const fakeGroup = {id: 10010};
        const fakeRepositories = [{username: 'fafgae', name: 'gshsrh'}];
        const fakeBody = {
            group: fakeGroup,
            repositories: fakeRepositories,
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
        parameterValidatorMock.removeRepositories.mockReturnValue(true);
        serviceMock.Group.removeRepositories.mockResolvedValue(fakeServiceResponse);
        const {removeRepositories} = await import('../Middleware');
        await (removeRepositories()(fakeContext, nextMock));
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
        expect(parameterValidatorMock.removeRepositories).toBeCalledTimes(1);
        expect(parameterValidatorMock.removeRepositories).toBeCalledWith(fakeBody);
        expect(serviceMock.Group.removeRepositories).toBeCalledTimes(1);
        expect(serviceMock.Group.removeRepositories).toBeCalledWith(fakeGroup, fakeRepositories, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});