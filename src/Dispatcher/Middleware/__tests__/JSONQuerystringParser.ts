import JSONQuerystringParser from '../JSONQuerystringParser';
import {IContext, IState} from '../../Interface';
import {Next, ParameterizedContext} from 'koa';
import {RouterContext} from '@koa/router';
import {WrongParameterError} from '../../Class';
import 'jest-extended';

describe(`${JSONQuerystringParser.name}`, () =>
{
    const nextMock = jest.fn<ReturnType<Next>, Parameters<Next>>();

    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.resetModules();
    });

    it('should throw WrongParameterError if ctx.request.body.json is undefined', async function ()
    {
        const fakeContext = {
            request: {
                query: {},
                body: null,
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        nextMock.mockResolvedValue(undefined);
        await expect((JSONQuerystringParser())(fakeContext, nextMock)).rejects.toBeInstanceOf(WrongParameterError);
        expect(nextMock).toBeCalledTimes(0);
        expect(fakeContext.request.body).toBeNull();
    });

    it('should throw WrongParameterError if json is invalid', async function ()
    {
        const fakeContext = {
            request: {
                query: {json: 'fabufiuaebfgiueagi'},
                body: null,
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        nextMock.mockResolvedValue(undefined);
        await expect((JSONQuerystringParser())(fakeContext, nextMock)).rejects.toBeInstanceOf(WrongParameterError);
        expect(nextMock).toBeCalledTimes(0);
        expect(fakeContext.request.body).toBeNull();
    });

    it('should set parse result to ctx.request.body and set before calling next()', async function ()
    {
        const fakeBody = {
            a: 1,
            b: '2',
            c: {
                d: 3,
            },
        };
        const fakeContext = {
            request: {
                query: {json: JSON.stringify(fakeBody)},
                body: null,
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const JSONParseMock = jest.spyOn(JSON, 'parse');
        nextMock.mockResolvedValue(undefined);
        await (JSONQuerystringParser())(fakeContext, nextMock);
        expect(fakeContext.request.body).toEqual(fakeBody);
        expect(nextMock).toBeCalledTimes(1);
        expect(JSONParseMock).toHaveBeenCalledBefore(nextMock);
        JSONParseMock.mockRestore();
    });

    it('should throw error if next() throws error', async function ()
    {
        const fakeBody = {
            a: 1,
            b: '2',
            c: {
                d: 3,
            },
        };
        const fakeContext = {
            request: {
                query: {json: JSON.stringify(fakeBody)},
                body: null,
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const nextError = new Error('hello, world');
        nextMock.mockRejectedValue(nextError);
        await expect((JSONQuerystringParser())(fakeContext, nextMock)).rejects.toThrow(nextError);
        expect(nextMock).toBeCalledTimes(1);
        expect(fakeContext.request.body).toEqual(fakeBody);
    });
});