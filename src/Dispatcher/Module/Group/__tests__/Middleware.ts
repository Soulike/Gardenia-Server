import {Session as SessionFunction} from '../../../../Function';
import * as ParameterValidator from '../ParameterValidator';
import {Group as GroupService} from '../../../../Service';
import {ParameterizedContext} from 'koa';
import {IContext, IState} from '../../../Interface';
import {RouterContext} from '@koa/router';
import {Session} from 'koa-session';
import {InvalidSessionError, WrongParameterError} from '../../../Class';
import {ResponseBody, ServiceResponse} from '../../../../Class';

const functionMock = {
    Session: {
        isSessionValid: jest.fn<ReturnType<typeof SessionFunction.isSessionValid>,
            Parameters<typeof SessionFunction.isSessionValid>>(),
    },
};

const parameterValidatorMock = {
    add: jest.fn<ReturnType<typeof ParameterValidator.add>,
        Parameters<typeof ParameterValidator.add>>(),
};

const serviceMock = {
    Group: {
        add: jest.fn<ReturnType<typeof GroupService.add>,
            Parameters<typeof GroupService.add>>(),
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
        const fakeGroup = {id: 10010};
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