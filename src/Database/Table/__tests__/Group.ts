import {
    addAccounts,
    addAdmins,
    addRepositories,
    deleteById,
    getAccountsById,
    getAdminsById,
    getRepositoriesById,
    insertAndReturnId,
    removeAccounts,
    removeAdmins,
    removeRepositories,
    selectById,
    update,
} from '../Group';
import {Account, Group, Repository} from '../../../Class';
import faker from 'faker';
import * as AccountTable from '../Account';
import * as RepositoryTable from '../Repository';
import {executeTransaction} from '../../Function';
import pool from '../../Pool';

describe(`${insertAndReturnId.name}`, () =>
{
    const fakeGroup = new Group(-1, faker.random.word());
    let fakeGroupId = -1;

    beforeEach(() =>
    {
        fakeGroupId = -1;
    });

    afterEach(async () =>
    {
        await deleteById(fakeGroupId);
    });

    it('should insert group and return id', async function ()
    {
        fakeGroupId = await insertAndReturnId(fakeGroup);
        const fakeGroupCopy = Group.from(fakeGroup);
        fakeGroupCopy.id = fakeGroupId;
        expect(await selectById(fakeGroupId)).toEqual(fakeGroupCopy);
    });
});

describe(`${deleteById.name}`, () =>
{
    const fakeGroup = new Group(-1, faker.random.word());
    let fakeGroupId = -1;

    beforeEach(async () =>
    {
        fakeGroupId = await insertAndReturnId(fakeGroup);
    });

    beforeEach(() =>
    {
        fakeGroupId = -1;
    });

    afterEach(async () =>
    {
        const client = await pool.connect();
        try
        {
            await executeTransaction(client, async client =>
            {
                await client.query(`DELETE
                                    FROM groups
                                    WHERE id = $1`, [fakeGroupId]);
            });
        }
        finally
        {
            client.release();
        }
    });

    it('should delete group by id', async function ()
    {
        await deleteById(fakeGroupId);
        expect(await selectById(fakeGroupId)).toBeNull();
    });
});

describe(`${update.name}`, () =>
{
    const fakeGroup = new Group(-1, faker.random.word());
    let fakeGroupId = -1;

    beforeEach(async () =>
    {
        fakeGroupId = await insertAndReturnId(fakeGroup);
    });

    afterEach(async () =>
    {
        await deleteById(fakeGroupId);
    });

    it('should update group', async function ()
    {
        const modifiedFakeGroup = Group.from(fakeGroup);
        modifiedFakeGroup.name = faker.random.word();
        modifiedFakeGroup.id = fakeGroupId;
        await update(modifiedFakeGroup, {id: fakeGroupId});
        expect(await selectById(fakeGroupId))
            .toStrictEqual(modifiedFakeGroup);
    });
});

describe(`${selectById.name}`, () =>
{
    const fakeGroup = new Group(-1, faker.random.word());
    let fakeGroupId = -1;

    beforeEach(async () =>
    {
        fakeGroupId = await insertAndReturnId(fakeGroup);
    });

    afterEach(async () =>
    {
        await deleteById(fakeGroupId);
    });

    it('should select by id', async function ()
    {
        const fakeGroupCopy = Group.from(fakeGroup);
        fakeGroupCopy.id = fakeGroupId;
        expect(await selectById(fakeGroupId)).toStrictEqual(fakeGroupCopy);
    });

    it('should return null when id does not exist', async function ()
    {
        expect(await selectById(-1)).toBeNull();
    });
});

describe(`${getAccountsById.name}`, () =>
{
    let fakeGroup1Id = -1;
    let fakeGroup2Id = -1;
    const fakeAccountsForFakeGroup1: Account[] = [
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
    ];
    const fakeAccountsForFakeGroup2: Account[] = [
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
    ];

    async function insertFakeGroups()
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertAndReturnId(new Group(-1, faker.random.word())),
            insertAndReturnId(new Group(-1, faker.random.word())),
        ]);
    }

    beforeAll(async () =>
    {
        await Promise.all([
            ...[...fakeAccountsForFakeGroup1, ...fakeAccountsForFakeGroup2]
                .map(account => AccountTable.insert(account)),
            insertFakeGroups(),
        ]);
        await Promise.all([
            addAccounts(fakeGroup1Id, fakeAccountsForFakeGroup1.map(({username}) => username)),
            addAccounts(fakeGroup2Id, fakeAccountsForFakeGroup2.map(({username}) => username)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteById(fakeGroup1Id),
            deleteById(fakeGroup2Id),
            ...[...fakeAccountsForFakeGroup1, ...fakeAccountsForFakeGroup2]
                .map(({username}) => AccountTable.deleteByUsername(username)),
        ]);
    });

    it('should get accounts by id', async function ()
    {
        const [fakeAccountsForFakeGroup1InDatabase, fakeAccountsForFakeGroup2InDatabase] =
            await Promise.all([
                getAccountsById(fakeGroup1Id),
                getAccountsById(fakeGroup2Id),
            ]);
        expect(fakeAccountsForFakeGroup1InDatabase.length).toBe(fakeAccountsForFakeGroup1.length);
        expect(fakeAccountsForFakeGroup1InDatabase)
            .toEqual(expect.arrayContaining(fakeAccountsForFakeGroup1));
        expect(fakeAccountsForFakeGroup1InDatabase.length).toBe(fakeAccountsForFakeGroup2.length);
        expect(fakeAccountsForFakeGroup2InDatabase)
            .toEqual(expect.arrayContaining(fakeAccountsForFakeGroup2));
    });
});

describe(`${addAccounts.name}`, () =>
{
    const fakeGroup = new Group(-1, faker.random.word());
    let fakeGroupId = -1;
    const fakeAccounts: Account[] = [
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
    ];
    beforeAll(async () =>
    {
        fakeGroupId = await insertAndReturnId(fakeGroup);
        await Promise.all(fakeAccounts.map(account => AccountTable.insert(account)));
    });

    afterAll(async () =>
    {
        await deleteById(fakeGroupId);
        await Promise.all(fakeAccounts.map(({username}) => AccountTable.deleteByUsername(username)));
    });

    it('should add accounts', async function ()
    {
        await addAccounts(fakeGroupId, fakeAccounts.map(fakeAccount => fakeAccount.username));
        const fakeAccountsInDatabase = await getAccountsById(fakeGroupId);
        expect(fakeAccountsInDatabase.length).toBe(fakeAccounts.length);
        expect(fakeAccountsInDatabase).toEqual(expect.arrayContaining(fakeAccounts));
    });
});

describe(`${removeAccounts.name}`, () =>
{
    let fakeGroup1Id = -1;
    let fakeGroup2Id = -1;
    const fakeAccountsForGroup1: Account[] = [
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
    ];
    const fakeAccountsForGroup2: Account[] = [
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
    ];

    beforeAll(async () =>
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertAndReturnId(new Group(-1, faker.random.word())),
            insertAndReturnId(new Group(-1, faker.random.word())),
        ]);
        await Promise.all([...fakeAccountsForGroup1, ...fakeAccountsForGroup2]
            .map(account => AccountTable.insert(account)));
        await Promise.all([
            addAccounts(fakeGroup1Id, fakeAccountsForGroup1.map(({username}) => username)),
            addAccounts(fakeGroup2Id, fakeAccountsForGroup2.map(({username}) => username)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteById(fakeGroup1Id),
            deleteById(fakeGroup2Id),
        ]);
        await Promise.all([...fakeAccountsForGroup1, ...fakeAccountsForGroup2]
            .map(({username}) => AccountTable.deleteByUsername(username)));
    });

    it('should remove accounts', async function ()
    {
        await removeAccounts(fakeGroup1Id, fakeAccountsForGroup1.map(({username}) => username));
        const fakeAccountsForGroup1InDatabase = await getAccountsById(fakeGroup1Id);
        expect(fakeAccountsForGroup1InDatabase.length).toBe(0);
    });

    it('should remove accounts by group', async function ()
    {
        await removeAccounts(fakeGroup1Id, fakeAccountsForGroup1.map(({username}) => username));
        const fakeAccountsForGroup2InDatabase = await getAccountsById(fakeGroup2Id);
        expect(fakeAccountsForGroup2InDatabase.length).toBe(fakeAccountsForGroup2.length);
        expect(fakeAccountsForGroup2InDatabase).toEqual(expect.arrayContaining(fakeAccountsForGroup2));
    });
});

describe(`${getAdminsById.name}`, () =>
{
    let fakeGroup1Id = -1;
    let fakeGroup2Id = -1;
    const fakeAdminAccountsForFakeGroup1: Account[] = [
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
    ];
    const fakeAdminAccountsForFakeGroup2: Account[] = [
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
    ];

    beforeAll(async () =>
    {
        await Promise.all([
            ...[...fakeAdminAccountsForFakeGroup1, ...fakeAdminAccountsForFakeGroup2]
                .map(account => AccountTable.insert(account)),
            insertFakeGroups(),
        ]);
        await Promise.all([
            addAccounts(fakeGroup1Id, fakeAdminAccountsForFakeGroup1.map(({username}) => username)),
            addAccounts(fakeGroup2Id, fakeAdminAccountsForFakeGroup2.map(({username}) => username)),
        ]);
        await Promise.all([
            addAdmins(fakeGroup1Id, fakeAdminAccountsForFakeGroup1.map(({username}) => username)),
            addAdmins(fakeGroup2Id, fakeAdminAccountsForFakeGroup2.map(({username}) => username)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteById(fakeGroup1Id),
            deleteById(fakeGroup2Id),
        ]);
        await Promise.all([...fakeAdminAccountsForFakeGroup1, ...fakeAdminAccountsForFakeGroup2]
            .map(({username}) => AccountTable.deleteByUsername(username)));
    });

    it('should get admin accounts by id', async function ()
    {
        const [fakeAdminAccountsForFakeGroup1InDatabase, fakeAdminAccountsForFakeGroup2InDatabase] =
            await Promise.all([
                getAdminsById(fakeGroup1Id),
                getAdminsById(fakeGroup2Id),
            ]);
        expect(fakeAdminAccountsForFakeGroup1InDatabase.length).toBe(fakeAdminAccountsForFakeGroup1.length);
        expect(fakeAdminAccountsForFakeGroup1InDatabase)
            .toEqual(expect.arrayContaining(fakeAdminAccountsForFakeGroup1));
        expect(fakeAdminAccountsForFakeGroup1InDatabase.length).toBe(fakeAdminAccountsForFakeGroup2.length);
        expect(fakeAdminAccountsForFakeGroup2InDatabase)
            .toEqual(expect.arrayContaining(fakeAdminAccountsForFakeGroup2));
    });

    async function insertFakeGroups()
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertAndReturnId(new Group(-1, faker.random.word())),
            insertAndReturnId(new Group(-1, faker.random.word())),
        ]);
    }
});

describe(`${addAdmins.name}`, () =>
{
    const fakeGroup = new Group(-1, faker.random.word());
    let fakeGroupId = -1;
    const fakeAdminAccounts: Account[] = [
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
    ];
    beforeAll(async () =>
    {
        fakeGroupId = await insertAndReturnId(fakeGroup);
        await Promise.all(fakeAdminAccounts.map(account => AccountTable.insert(account)));
        await addAccounts(fakeGroupId, fakeAdminAccounts.map(({username}) => username));
    });

    afterAll(async () =>
    {
        await removeAdmins(fakeGroupId, fakeAdminAccounts.map(({username}) => username));
        await Promise.all([
            removeAccounts(fakeGroupId, fakeAdminAccounts.map(({username}) => username)),
            deleteById(fakeGroupId),
        ]);
        await Promise.all(fakeAdminAccounts
            .map(({username}) => AccountTable.deleteByUsername(username)));
    });

    it('should add admin accounts', async function ()
    {
        await addAdmins(fakeGroupId, fakeAdminAccounts.map(fakeAccount => fakeAccount.username));
        const fakeAdminAccountsInDatabase = await getAdminsById(fakeGroupId);
        expect(fakeAdminAccountsInDatabase.length).toBe(fakeAdminAccounts.length);
        expect(fakeAdminAccountsInDatabase).toEqual(expect.arrayContaining(fakeAdminAccounts));
    });
});

describe(`${removeAdmins.name}`, () =>
{
    let fakeGroup1Id = -1;
    let fakeGroup2Id = -1;
    const fakeAccountsForGroup1: Account[] = [
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
    ];
    const fakeAccountsForGroup2: Account[] = [
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
        new Account(faker.name.firstName(), faker.random.alphaNumeric(64)),
    ];

    beforeAll(async () =>
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertAndReturnId(new Group(-1, faker.random.word())),
            insertAndReturnId(new Group(-1, faker.random.word())),
        ]);
        await Promise.all([...fakeAccountsForGroup1, ...fakeAccountsForGroup2]
            .map(account => AccountTable.insert(account)));
        await Promise.all([
            addAccounts(fakeGroup1Id, fakeAccountsForGroup1.map(({username}) => username)),
            addAccounts(fakeGroup2Id, fakeAccountsForGroup2.map(({username}) => username)),
        ]);
        await Promise.all([
            addAdmins(fakeGroup1Id, fakeAccountsForGroup1.map(({username}) => username)),
            addAdmins(fakeGroup2Id, fakeAccountsForGroup2.map(({username}) => username)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteById(fakeGroup1Id),
            deleteById(fakeGroup2Id),
        ]);
        await Promise.all([...fakeAccountsForGroup1, ...fakeAccountsForGroup2]
            .map(({username}) => AccountTable.deleteByUsername(username)));
    });

    it('should remove admin accounts', async function ()
    {
        await removeAdmins(fakeGroup1Id, fakeAccountsForGroup1.map(({username}) => username));
        const fakeAccountsForGroup1InDatabase = await getAdminsById(fakeGroup1Id);
        expect(fakeAccountsForGroup1InDatabase.length).toBe(0);
    });

    it('should remove admin accounts by group', async function ()
    {
        await removeAdmins(fakeGroup1Id, fakeAccountsForGroup1.map(({username}) => username));
        const fakeAccountsForGroup2InDatabase = await getAdminsById(fakeGroup2Id);
        expect(fakeAccountsForGroup2InDatabase.length).toBe(fakeAccountsForGroup2.length);
        expect(fakeAccountsForGroup2InDatabase).toEqual(expect.arrayContaining(fakeAccountsForGroup2));
    });
});

describe(`${getRepositoriesById.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    let fakeGroup1Id = -1;
    let fakeGroup2Id = -1;
    const fakeRepositoriesForFakeGroup1: Repository[] = [
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
    ];
    const fakeRepositoriesForFakeGroup2: Repository[] = [
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
    ];

    async function insertFakeGroupsAndReturnIds()
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertAndReturnId({name: faker.random.word()}),
            insertAndReturnId({name: faker.random.word()}),
        ]);
    }

    beforeAll(async () =>
    {
        await Promise.all([
            AccountTable.insert(fakeAccount),
            insertFakeGroupsAndReturnIds(),
        ]);
        await Promise.all([...fakeRepositoriesForFakeGroup1, ...fakeRepositoriesForFakeGroup2]
            .map(repository => RepositoryTable.insert(repository)));
        await Promise.all([
            addRepositories(fakeGroup1Id, fakeRepositoriesForFakeGroup1),
            addRepositories(fakeGroup2Id, fakeRepositoriesForFakeGroup2),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteById(fakeGroup1Id),
            deleteById(fakeGroup2Id),
            ...[...fakeRepositoriesForFakeGroup1, ...fakeRepositoriesForFakeGroup2]
                .map(({username, name}) => RepositoryTable.deleteByUsernameAndName({username, name})),
            AccountTable.deleteByUsername(fakeAccount.username),
        ]);
    });

    it('should get repositories by id', async function ()
    {
        const [fakeRepositoriesForFakeGroup1InDatabase, fakeRepositoriesForFakeGroup2InDatabase] =
            await Promise.all([
                getRepositoriesById(fakeGroup1Id),
                getRepositoriesById(fakeGroup2Id),
            ]);
        expect(fakeRepositoriesForFakeGroup1InDatabase.length).toBe(fakeRepositoriesForFakeGroup1.length);
        expect(fakeRepositoriesForFakeGroup1InDatabase)
            .toEqual(expect.arrayContaining(fakeRepositoriesForFakeGroup1));
        expect(fakeRepositoriesForFakeGroup2InDatabase.length).toBe(fakeRepositoriesForFakeGroup2.length);
        expect(fakeRepositoriesForFakeGroup2InDatabase)
            .toEqual(expect.arrayContaining(fakeRepositoriesForFakeGroup2));
    });
});

describe(`${addRepositories.name}`, () =>
{
    const fakeGroup = new Group(-1, faker.random.word());
    let fakeGroupId = -1;
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeRepositories: Repository[] = [
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
    ];
    beforeAll(async () =>
    {
        [, fakeGroupId] = await Promise.all([
            AccountTable.insert(fakeAccount),
            insertAndReturnId(fakeGroup),
        ]);
        await Promise.all(fakeRepositories.map(repository => RepositoryTable.insert(repository)));
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteById(fakeGroupId),
            ...fakeRepositories
                .map(({username, name}) => RepositoryTable.deleteByUsernameAndName({username, name})),
            AccountTable.deleteByUsername(fakeAccount.username),
        ]);
        fakeGroupId = -1;
    });

    it('should add repositories', async function ()
    {
        await addRepositories(fakeGroupId, fakeRepositories);
        const fakeRepositoriesInDatabase = await getRepositoriesById(fakeGroupId);
        expect(fakeRepositoriesInDatabase.length).toBe(fakeRepositories.length);
        expect(fakeRepositoriesInDatabase).toEqual(expect.arrayContaining(fakeRepositories));
    });
});

describe(`${removeRepositories.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    let fakeGroup1Id = -1;
    let fakeGroup2Id = -1;
    const fakeRepositoriesForGroup1: Repository[] = [
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
    ];
    const fakeRepositoriesForGroup2: Repository[] = [
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
    ];

    beforeAll(async () =>
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertAndReturnId(new Group(-1, faker.random.word())),
            insertAndReturnId(new Group(-1, faker.random.word())),
            AccountTable.insert(fakeAccount),
        ]);
        await Promise.all([
            ...[...fakeRepositoriesForGroup1, ...fakeRepositoriesForGroup2]
                .map(repository => RepositoryTable.insert(repository)),
        ]);
        await Promise.all([
            await addRepositories(fakeGroup1Id, fakeRepositoriesForGroup1),
            await addRepositories(fakeGroup2Id, fakeRepositoriesForGroup2),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteById(fakeGroup1Id),
            deleteById(fakeGroup2Id),
            ...[...fakeRepositoriesForGroup1, ...fakeRepositoriesForGroup2]
                .map(({username, name}) => RepositoryTable.deleteByUsernameAndName({username, name})),
        ]);
        await AccountTable.deleteByUsername(fakeAccount.username);
    });

    it('should remove repositories', async function ()
    {
        await removeRepositories(fakeGroup1Id, fakeRepositoriesForGroup1);
        const fakeRepositoriesForGroup1InDatabase = await getRepositoriesById(fakeGroup1Id);
        expect(fakeRepositoriesForGroup1InDatabase.length).toBe(0);
    });

    it('should remove repositories by group', async function ()
    {
        await removeRepositories(fakeGroup1Id, fakeRepositoriesForGroup1);
        const fakeRepositoriesForGroup2InDatabase = await getRepositoriesById(fakeGroup2Id);
        expect(fakeRepositoriesForGroup2InDatabase.length).toBe(fakeRepositoriesForGroup2.length);
        expect(fakeRepositoriesForGroup2InDatabase).toEqual(expect.arrayContaining(fakeRepositoriesForGroup2));
    });
});