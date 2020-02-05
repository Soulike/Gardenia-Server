import {AccountRepository} from '../AccountRepository';

describe(`${AccountRepository.name}`, () =>
{
    it('should construct AccountRepository instance', function ()
    {
        const fakeStar: AccountRepository = {
            username: 'aefaf',
            repository_username: 'hreshsrh',
            repository_name: 'ghshbrswhsrh',
        };
        expect(new AccountRepository(
            fakeStar.username,
            fakeStar.repository_username,
            fakeStar.repository_name)).toEqual(fakeStar);
    });

    it('should convert object to AccountRepository instance', function ()
    {
        const fakeStar: AccountRepository = {
            username: 'aefaf',
            repository_username: 'hreshsrh',
            repository_name: 'ghshbrswhsrh',
        };
        expect(AccountRepository.from(fakeStar)).toEqual(fakeStar);
    });

    it('should check the type of "username" in converted object', function ()
    {
        const fakeStar: Record<keyof AccountRepository, any> = {
            username: 100,
            repository_username: 'hreshsrh',
            repository_name: 'ghshbrswhsrh',
        };
        expect(() => AccountRepository.from(fakeStar)).toThrow(TypeError);
    });

    it('should check the type of "repository_username" in converted object', function ()
    {
        const fakeStar: Record<keyof AccountRepository, any> = {
            username: 'gaegaesg',
            repository_username: false,
            repository_name: 'ghshbrswhsrh',
        };
        expect(() => AccountRepository.from(fakeStar)).toThrow(TypeError);
    });

    it('should check the type of "repository_name" in converted object', function ()
    {
        const fakeStar: Record<keyof AccountRepository, any> = {
            username: 'gaegaesg',
            repository_username: 'agegaehsrh',
            repository_name: Symbol(),
        };
        expect(() => AccountRepository.from(fakeStar)).toThrow(TypeError);
    });
});