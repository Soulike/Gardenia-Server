import {Next, ParameterizedContext} from 'koa';
import {IContext, IState} from '../../Interface';
import {RouterContext} from '@koa/router';
import {SERVER} from '../../../CONFIG';
import {ResponseBody, ServiceResponse} from '../../../Class';
import errorHandler from '../errorHandler';

describe(`${errorHandler.name}`, () =>
{
    const nextMock = jest.fn<ReturnType<Next>, Parameters<Next>>();
    const CONFIGMock = {
        SERVER: {
            ERROR_LOGGER: jest.fn<ReturnType<typeof SERVER.ERROR_LOGGER>, Parameters<typeof SERVER.ERROR_LOGGER>>(),
        },
    };

    beforeEach(() =>
    {
        jest.resetAllMocks();
    });

    it('should call next() if no error', async function ()
    {
        const fakeContext = {
            state: <IState>{},
            response: {
                status: 404,
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        nextMock.mockResolvedValue(undefined);
        const {default: errorHandler} = await import('../errorHandler');
        await (errorHandler())(fakeContext, nextMock);
        expect(nextMock).toBeCalledTimes(1);
    });

    it('should set ctx.response.body if error is predefined ServiceResponse', async function ()
    {
        const fakeContext = {
            state: <IState>{},
            response: {
                status: 404,
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;

        class PredefinedError extends ServiceResponse<void>
        {
            constructor()
            {
                super(400, {}, new ResponseBody(false, ''));
            }
        }

        const predefinedError = new PredefinedError();
        nextMock.mockRejectedValue(predefinedError);
        const {default: errorHandler} = await import('../errorHandler');
        await (errorHandler())(fakeContext, nextMock);
        expect(nextMock).toBeCalledTimes(1);
        expect(fakeContext.response.status).toBe(404);
        expect(fakeContext.state.serviceResponse).toEqual(predefinedError);
    });

    it('should respond with 500 and print error if error is not predefined ServiceResponse', async function ()
    {
        jest.resetModules();
        jest.mock('../../../CONFIG', () => CONFIGMock);
        const fakeContext = {
            state: <IState>{},
            response: {
                status: 404,
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeError = new Error();
        nextMock.mockRejectedValue(fakeError);
        const {default: errorHandler} = await import('../errorHandler');
        await (errorHandler())(fakeContext, nextMock);
        expect(nextMock).toBeCalledTimes(1);
        expect(CONFIGMock.SERVER.ERROR_LOGGER).toBeCalledTimes(1);
        expect(CONFIGMock.SERVER.ERROR_LOGGER).toBeCalledWith(fakeError);
        expect(fakeContext.response.status).toBe(500);
        expect(fakeContext.state.serviceResponse).toBeUndefined();
    });
});