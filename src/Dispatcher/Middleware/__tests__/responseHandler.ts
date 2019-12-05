import {Next, ParameterizedContext} from 'koa';
import {IContext, IState} from '../../Interface';
import {RouterContext} from '@koa/router';
import responseHandler from '../responseHandler';
import 'jest-extended';
import {ResponseBody, ServiceResponse} from '../../../Class';
import {Readable, Writable} from 'stream';

describe(`${responseHandler.name}`, () =>
{
    const nextMock = jest.fn<ReturnType<Next>, Parameters<Next>>();

    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.resetModules();
    });

    it('should handle ServiceResponse with ResponseBody', async function ()
    {
        const originalSession = {a: '1'};
        const addedSession = {b: '2'};
        const responseSetMock = jest.fn();
        const fakeHeaders = {c: '3'};
        const fakeStatusCode = 200;
        // body is a ServiceResponse
        const fakeResponseBody = new ResponseBody(true, 'fafafaaw', 'gehgeswahsrwhsrh');
        const fakeContext = {
            state: <IState>{
                serviceResponse: new ServiceResponse(fakeStatusCode, fakeHeaders,
                    fakeResponseBody, addedSession),
            },
            response: {
                status: 404,
                set: responseSetMock,
                body: null,
            },
            session: {...originalSession},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        nextMock.mockResolvedValue(undefined);
        await (responseHandler())(fakeContext, nextMock);
        expect(nextMock).toBeCalledTimes(1);
        expect(responseSetMock).toBeCalledTimes(1);
        expect(responseSetMock).toBeCalledWith(fakeHeaders);
        // next is called first
        expect(nextMock).toHaveBeenCalledBefore(responseSetMock);
        // merges sessions
        expect(fakeContext.session).toEqual({...originalSession, ...addedSession});
        expect(fakeContext.response.status).toBe(fakeStatusCode);
        // works on ctx.response.body
        expect(fakeContext.response.body).toEqual(fakeResponseBody);
    });

    it('should handle ServiceResponse with Readable', async function ()
    {
        const originalSession = {a: '1'};
        const addedSession = {b: '2'};
        const responseSetMock = jest.fn();
        const fakeHeaders = {c: '3'};
        const fakeStatusCode = 200;
        const fakeReadableStreamContent = 'fabibfaeiubfgiauebgfieabgo;eahgoaehg';
        const fakeWritableStreamDestination: any[] = [];
        // body is a Readable
        const fakeResponseBody = new Readable({
            read(): void
            {
                this.push(fakeReadableStreamContent);
                this.push(null);
            },
        });
        const fakeContext = {
            state: <IState>{
                serviceResponse: new ServiceResponse(fakeStatusCode, fakeHeaders,
                    fakeResponseBody, addedSession),
            },
            response: {
                status: 404,
                set: responseSetMock,
                body: null,
            },
            res: new Writable({
                write(chunk: any): void
                {
                    fakeWritableStreamDestination.push(chunk);
                },
            }),
            session: {...originalSession},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        nextMock.mockResolvedValue(undefined);
        await (responseHandler())(fakeContext, nextMock);
        expect(nextMock).toBeCalledTimes(1);
        expect(responseSetMock).toBeCalledTimes(1);
        expect(responseSetMock).toBeCalledWith(fakeHeaders);
        // next is called first
        expect(nextMock).toHaveBeenCalledBefore(responseSetMock);
        // merges sessions
        expect(fakeContext.session).toEqual({...originalSession, ...addedSession});
        expect(fakeContext.response.status).toBe(fakeStatusCode);
        // doesn't use ctx.response.body
        expect(fakeContext.response.body).toBeNull();
        // can use stream to send Readable data to Writeable
        expect(fakeWritableStreamDestination.join('')).toBe(fakeReadableStreamContent);
    });
});