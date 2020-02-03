import {Account, Repository, Star} from '../../../Class';
import {Account as AccountTable, Repository as RepositoryTable} from '../../../Database';
import {count, del, insert, select} from '../Star';

describe(`${insert.name}`, () =>
{
    const fakeAccount = new Account('feafae', 'gaeg');
    const fakeRepositoryAccount = new Account('feafaaefeage', 'gaeg');
    const fakeRepository = new Repository(fakeRepositoryAccount.username, 'gaegae', '', false);
    const fakeStar = new Star(fakeAccount.username, fakeRepository.username, fakeRepository.name);

    beforeEach(async () =>
    {
        await AccountTable.insert(fakeAccount);
        await AccountTable.insert(fakeRepositoryAccount);
        await RepositoryTable.insert(fakeRepository);
    });

    afterEach(async () =>
    {
        await RepositoryTable.deleteByUsernameAndName(fakeRepository);
        await AccountTable.deleteByUsername(fakeAccount.username);
        await AccountTable.deleteByUsername(fakeRepositoryAccount.username);
    });

    it('should insert star instance', async function ()
    {
        await insert(fakeStar);
        expect(await select(fakeStar)).toEqual([fakeStar]);
    });
});

describe(`${del.name}`, () =>
{
    const fakeAccount = new Account('agaesgseag', 'gaeg');
    const fakeRepositoryAccount = new Account('jntdrjmdftk', 'gaeg');
    const fakeRepository = new Repository(fakeRepositoryAccount.username, 'sagaesg', '', false);
    const fakeStar = new Star(fakeAccount.username, fakeRepository.username, fakeRepository.name);

    beforeEach(async () =>
    {
        await AccountTable.insert(fakeAccount);
        await AccountTable.insert(fakeRepositoryAccount);
        await RepositoryTable.insert(fakeRepository);
        await insert(fakeStar);
    });

    afterEach(async () =>
    {
        await RepositoryTable.deleteByUsernameAndName(fakeRepository);
        await AccountTable.deleteByUsername(fakeAccount.username);
        await AccountTable.deleteByUsername(fakeRepositoryAccount.username);
    });

    it('should delete Star instance', async function ()
    {
        await del(fakeStar);
        expect(await select(fakeStar)).toEqual([]);
    });
});

describe(`${select.name}`, () =>
{
    const fakeAccount = new Account('agaessrhsrhgseag', 'gaeg');
    const fakeRepositoryAccount = new Account('agawg', 'gaeg');
    const fakeRepositories = [
        new Repository(fakeRepositoryAccount.username, 'ghaehrsh', '', false),
        new Repository(fakeRepositoryAccount.username, 'agaeg', '', false),
        new Repository(fakeRepositoryAccount.username, 'saerhsrh', '', false),
    ];
    const fakeStars = [
        new Star(fakeAccount.username, fakeRepositories[0].username, fakeRepositories[0].name),
        new Star(fakeAccount.username, fakeRepositories[2].username, fakeRepositories[2].name),
    ];

    beforeAll(async () =>
    {
        await AccountTable.insert(fakeAccount);
        await AccountTable.insert(fakeRepositoryAccount);
        await Promise.all(
            fakeRepositories.map(repository => RepositoryTable.insert(repository)));
        await Promise.all(
            fakeStars.map(star => insert(star)));
    });

    afterAll(async () =>
    {
        await Promise.all(
            fakeRepositories.map(repository => RepositoryTable.deleteByUsernameAndName(repository)));
        await AccountTable.deleteByUsername(fakeAccount.username);
        await AccountTable.deleteByUsername(fakeRepositoryAccount.username);
    });

    it('should select Star instance', async function ()
    {
        expect(await select({username: fakeAccount.username}))
            .toEqual(fakeStars);
    });
});

describe(`${count.name}`, () =>
{
    const fakeAccount = new Account('agahsrhsrh', 'gaeg');
    const fakeRepositoryAccount = new Account('ataetaesgh', 'gaeg');
    const fakeRepositories = [
        new Repository(fakeRepositoryAccount.username, 'h34hew', '', false),
        new Repository(fakeRepositoryAccount.username, 'a3yas', '', false),
        new Repository(fakeRepositoryAccount.username, 'hjeje5', '', false),
    ];
    const fakeStars = [
        new Star(fakeAccount.username, fakeRepositories[0].username, fakeRepositories[0].name),
        new Star(fakeAccount.username, fakeRepositories[2].username, fakeRepositories[2].name),
    ];

    beforeAll(async () =>
    {
        await AccountTable.insert(fakeAccount);
        await AccountTable.insert(fakeRepositoryAccount);
        await Promise.all(
            fakeRepositories.map(repository => RepositoryTable.insert(repository)));
        await Promise.all(
            fakeStars.map(star => insert(star)));
    });

    afterAll(async () =>
    {
        await Promise.all(
            fakeRepositories.map(repository => RepositoryTable.deleteByUsernameAndName(repository)));
        await AccountTable.deleteByUsername(fakeAccount.username);
        await AccountTable.deleteByUsername(fakeRepositoryAccount.username);
    });

    it('should count Star instance', async function ()
    {
        expect(await count({username: fakeAccount.username}))
            .toEqual(fakeStars.length);
        expect(await count({
            repository_name: fakeRepositories[0].name,
            repository_username: fakeRepositories[0].username,
        })).toEqual(1);
    });
});