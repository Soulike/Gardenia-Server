import {prefix} from './Function';
import 'jest-extended';

describe(`${prefix.name}`, () =>
{
    it('should prefix url', function ()
    {
        const fakeURL = '/faegaeg/gaegaega';
        expect(prefix(fakeURL)).toBe('/server' + fakeURL);
    });
});