import {Star} from '../Star';

describe(`${Star.name}`, () =>
{
    it('should construct Star instance', function ()
    {
        const fakeStar: Star = {
            username: 'aefaf',
            repository_username: 'hreshsrh',
            repository_name: 'ghshbrswhsrh',
        };
        expect(new Star(
            fakeStar.username,
            fakeStar.repository_username,
            fakeStar.repository_name)).toEqual(fakeStar);
    });

    it('should convert object to Star instance', function ()
    {
        const fakeStar: Star = {
            username: 'aefaf',
            repository_username: 'hreshsrh',
            repository_name: 'ghshbrswhsrh',
        };
        expect(Star.from(fakeStar)).toEqual(fakeStar);
    });

    it('should check the type of "username" in converted object', function ()
    {
        const fakeStar: Record<keyof Star, any> = {
            username: 100,
            repository_username: 'hreshsrh',
            repository_name: 'ghshbrswhsrh',
        };
        expect(() => Star.from(fakeStar)).toThrow(TypeError);
    });

    it('should check the type of "repository_username" in converted object', function ()
    {
        const fakeStar: Record<keyof Star, any> = {
            username: 'gaegaesg',
            repository_username: false,
            repository_name: 'ghshbrswhsrh',
        };
        expect(() => Star.from(fakeStar)).toThrow(TypeError);
    });

    it('should check the type of "repository_name" in converted object', function ()
    {
        const fakeStar: Record<keyof Star, any> = {
            username: 'gaegaesg',
            repository_username: 'agegaehsrh',
            repository_name: Symbol(),
        };
        expect(() => Star.from(fakeStar)).toThrow(TypeError);
    });
});