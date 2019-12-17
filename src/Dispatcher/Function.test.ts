import {isSessionValid, prefix} from './Function';
import {Session} from 'koa-session';
import 'jest-extended';

describe(`${prefix.name}`, () =>
{
    it('should prefix url', function ()
    {
        const fakeURL = '/faegaeg/gaegaega';
        expect(prefix(fakeURL)).toBe('/server' + fakeURL);
    });
});

describe(`${isSessionValid.name}`, () =>
{
    it('should handle valid session', function ()
    {
        const fakeSession = {
            username: 'faefaef',
        } as unknown as Session;
        expect(isSessionValid(fakeSession)).toBeTrue();
    });

    it('should handle invalid session', function ()
    {
        const fakeSession = {} as unknown as Session;
        expect(isSessionValid(fakeSession)).toBeFalse();
    });
});