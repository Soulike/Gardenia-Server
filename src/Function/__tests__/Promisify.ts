import {execPromise, waitForEvent} from '../Promisify';
import EventEmitter from 'events';

describe(`${execPromise.name}`, () =>
{
    const str = 'hello world';

    it('should execute command and resolve result', async function ()
    {
        expect(await execPromise(`echo ${str}`)).toBe(`${str}\n`);
    });

    it('should reject when exec throws an error', async function ()
    {
        await expect(execPromise(`gsgsrgsrg`)).rejects.toThrow();
    });

    it('should reject error in executing command', async function ()
    {
        await expect(execPromise(`echo ${str} >& 2`)).rejects.toThrow();
    });
});

describe(`${waitForEvent.name}`, () =>
{
    const eventEmitter = new EventEmitter();
    const event = 'event';
    const params = [1, 2, 3, 4, 5];
    const time = 100; // ms

    it('should resolve after event is emitted and return params', async function ()
    {
        setTimeout(() =>
        {
            eventEmitter.emit(event, ...params);
        }, time);
        expect(await waitForEvent(eventEmitter, event)).toStrictEqual(params);
    });

    it('should reject when event emitter emitting error', async function ()
    {
        const error = new Error('test');
        setTimeout(() =>
        {
            eventEmitter.emit('error', error);
        }, time);
        await expect(waitForEvent(eventEmitter, event)).rejects.toThrow(error);
    });
});