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
    selectById,
    update,
} from '../Group';
import {PoolClient} from 'pg';
import {Account, Group, Repository} from '../../../Class';
import faker from 'faker';
import pool from '../../Pool';
import {
    deleteAccountsGroup,
    deleteAdminsGroup,
    deleteFakeAccount,
    deleteFakeAccounts,
    deleteFakeGroupById,
    deleteFakeGroupsByIds,
    deleteFakeRepositories,
    deleteRepositoriesGroup,
    insertAccountsGroup,
    insertAdminsGroup,
    insertFakeAccount,
    insertFakeAccounts,
    insertFakeGroupAndReturnId,
    insertFakeRepositories,
    insertRepositoriesGroup,
    selectAccountsByGroup,
    selectAdminsByGroup,
    selectFakeGroupById,
    selectRepositoriesByGroup,
} from '../_TestHelper';

let client: PoolClient;

let fakeGroupId = -1;
const fakeGroup = new Group(-1, faker.random.word());

beforeAll(async () =>
{
    client = await pool.connect();
});

afterAll(() =>
{
    client.release();
});

describe(insertAndReturnId, () =>
{
    afterEach(async () =>
    {
        await deleteFakeGroupById(client, fakeGroupId);
        fakeGroupId = -1;
    });

    it('should insert group and return id', async function ()
    {
        fakeGroupId = await insertAndReturnId(fakeGroup);
        const fakeGroupCopy = Group.from(fakeGroup);
        fakeGroupCopy.id = fakeGroupId;
        expect(await selectFakeGroupById(client, fakeGroupId)).toEqual(fakeGroupCopy);
    });
});

describe(deleteById, () =>
{
    beforeEach(async () =>
    {
        fakeGroupId = await insertFakeGroupAndReturnId(client, fakeGroup);
    });

    afterEach(async () =>
    {
        await deleteFakeGroupById(client, fakeGroupId);
        fakeGroupId = -1;
    });

    it('should delete group by id', async function ()
    {
        await deleteById(fakeGroupId);
        expect(await selectFakeGroupById(client, fakeGroupId)).toBeNull();
    });
});

describe(update, () =>
{
    beforeEach(async () =>
    {
        fakeGroupId = await insertFakeGroupAndReturnId(client, fakeGroup);
    });

    afterEach(async () =>
    {
        await deleteFakeGroupById(client, fakeGroupId);
        fakeGroupId = -1;
    });

    it('should update group', async function ()
    {
        const modifiedFakeGroup = Group.from(fakeGroup);
        modifiedFakeGroup.name = faker.random.word();
        modifiedFakeGroup.id = fakeGroupId;
        await update(modifiedFakeGroup);
        expect(await selectFakeGroupById(client, fakeGroupId))
            .toStrictEqual(modifiedFakeGroup);
    });
});

describe(selectById, () =>
{
    beforeEach(async () =>
    {
        fakeGroupId = await insertFakeGroupAndReturnId(client, fakeGroup);
    });

    afterEach(async () =>
    {
        await deleteFakeGroupById(client, fakeGroupId);
        fakeGroupId = -1;
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

describe(getAccountsById, () =>
{
    let fakeGroup1Id = -1;
    let fakeGroup2Id = -1;
    const fakeAccountsForFakeGroup1: Account[] = [];
    const fakeAccountsForFakeGroup2: Account[] = [];

    beforeAll(async () =>
    {
        generateFakeAccounts();
        await Promise.all([
            insertFakeAccounts(client, fakeAccountsForFakeGroup1),
            insertFakeAccounts(client, fakeAccountsForFakeGroup2),
            insertFakeGroups(),
        ]);
        await Promise.all([
            insertAccountsGroup(client, fakeAccountsForFakeGroup1.map(({username}) => username), fakeGroup1Id),
            insertAccountsGroup(client, fakeAccountsForFakeGroup2.map(({username}) => username), fakeGroup2Id),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteAccountsGroup(client, fakeAccountsForFakeGroup1.map(({username}) => username), fakeGroup1Id),
            deleteAccountsGroup(client, fakeAccountsForFakeGroup2.map(({username}) => username), fakeGroup2Id),
        ]);
        await Promise.all([
            deleteFakeGroupsByIds(client, [fakeGroup1Id, fakeGroup2Id]),
            deleteFakeAccounts(client, fakeAccountsForFakeGroup1.map(({username}) => username)),
            deleteFakeAccounts(client, fakeAccountsForFakeGroup2.map(({username}) => username)),
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

    function generateFakeAccounts()
    {
        for (let i = 0; i < 5; i++)
        {
            fakeAccountsForFakeGroup1.push(new Account(faker.name.firstName() + i, faker.random.alphaNumeric(64)));
            fakeAccountsForFakeGroup2.push(new Account(i + faker.name.firstName(), faker.random.alphaNumeric(64)));
        }
    }

    async function insertFakeGroups()
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
        ]);
    }
});

describe(addAccounts, () =>
{
    const fakeAccounts: Account[] = [];
    beforeAll(async () =>
    {
        generateFakeAccounts();
        [, fakeGroupId] = await Promise.all([
            insertFakeAccounts(client, fakeAccounts),
            insertFakeGroupAndReturnId(client, fakeGroup),
        ]);
    });

    afterAll(async () =>
    {
        await deleteAccountsGroup(client, fakeAccounts.map(({username}) => username), fakeGroupId);
        await Promise.all([
            deleteFakeGroupById(client, fakeGroupId),
            deleteFakeAccounts(client, fakeAccounts.map(({username}) => username)),
        ]);
        fakeGroupId = -1;
    });

    it('should add accounts', async function ()
    {
        await addAccounts(fakeGroupId, fakeAccounts.map(fakeAccount => fakeAccount.username));
        const fakeAccountsInDatabase = await selectAccountsByGroup(client, fakeGroupId);
        expect(fakeAccountsInDatabase.length).toBe(fakeAccounts.length);
        expect(fakeAccountsInDatabase).toEqual(expect.arrayContaining(fakeAccounts));
    });

    function generateFakeAccounts()
    {
        for (let i = 0; i < 5; i++)
        {
            fakeAccounts.push(new Account(faker.name.firstName() + i, faker.random.alphaNumeric(64)));
        }
    }
});

describe(removeAccounts, () =>
{
    let fakeGroup1Id = -1;
    let fakeGroup2Id = -1;
    const fakeAccountsForGroup1: Account[] = [];
    const fakeAccountsForGroup2: Account[] = [];

    beforeAll(async () =>
    {
        generateFakeAccounts();
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
            insertFakeAccounts(client, fakeAccountsForGroup1),
            insertFakeAccounts(client, fakeAccountsForGroup2),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteFakeGroupsByIds(client, [fakeGroup1Id, fakeGroup2Id]),
            deleteFakeAccounts(client, fakeAccountsForGroup1.map(({username}) => username)),
            deleteFakeAccounts(client, fakeAccountsForGroup2.map(({username}) => username)),
        ]);
    });

    it('should remove accounts', async function ()
    {
        await removeAccounts(fakeGroup1Id, fakeAccountsForGroup1.map(({username}) => username));
        const fakeAccountsForGroup1InDatabase = await selectAccountsByGroup(client, fakeGroup1Id);
        expect(fakeAccountsForGroup1InDatabase.length).toBe(0);
    });

    it('should remove accounts by group', async function ()
    {
        await removeAccounts(fakeGroup1Id, fakeAccountsForGroup1.map(({username}) => username));
        const fakeAccountsForGroup2InDatabase = await selectAccountsByGroup(client, fakeGroup2Id);
        expect(fakeAccountsForGroup2InDatabase.length).toBe(fakeAccountsForGroup2.length);
        expect(fakeAccountsForGroup2InDatabase).toEqual(expect.arrayContaining(fakeAccountsForGroup2));
    });

    function generateFakeAccounts()
    {
        for (let i = 0; i < 5; i++)
        {
            fakeAccountsForGroup1.push(new Account(faker.name.firstName() + i, faker.random.alphaNumeric(64)));
            fakeAccountsForGroup1.push(new Account(i + faker.name.firstName(), faker.random.alphaNumeric(64)));
        }
    }
});

describe(getAdminsById, () =>
{
    let fakeGroup1Id = -1;
    let fakeGroup2Id = -1;
    const fakeAdminAccountsForFakeGroup1: Account[] = [];
    const fakeAdminAccountsForFakeGroup2: Account[] = [];

    beforeAll(async () =>
    {
        generateFakeAccounts();
        await Promise.all([
            insertFakeAccounts(client, fakeAdminAccountsForFakeGroup1),
            insertFakeAccounts(client, fakeAdminAccountsForFakeGroup2),
            insertFakeGroups(),
        ]);
        await Promise.all([
            insertAccountsGroup(client, fakeAdminAccountsForFakeGroup1.map(({username}) => username), fakeGroup1Id),
            insertAccountsGroup(client, fakeAdminAccountsForFakeGroup2.map(({username}) => username), fakeGroup2Id),
        ]);
        await Promise.all([
            insertAdminsGroup(client, fakeAdminAccountsForFakeGroup1.map(({username}) => username), fakeGroup1Id),
            insertAdminsGroup(client, fakeAdminAccountsForFakeGroup2.map(({username}) => username), fakeGroup2Id),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteAdminsGroup(client, fakeAdminAccountsForFakeGroup1.map(({username}) => username), fakeGroup1Id),
            deleteAdminsGroup(client, fakeAdminAccountsForFakeGroup2.map(({username}) => username), fakeGroup2Id),
        ]);
        await Promise.all([
            deleteAccountsGroup(client, fakeAdminAccountsForFakeGroup1.map(({username}) => username), fakeGroup1Id),
            deleteAccountsGroup(client, fakeAdminAccountsForFakeGroup2.map(({username}) => username), fakeGroup2Id),
        ]);
        await Promise.all([
            deleteFakeGroupsByIds(client, [fakeGroup1Id, fakeGroup2Id]),
            deleteFakeAccounts(client, fakeAdminAccountsForFakeGroup1.map(({username}) => username)),
            deleteFakeAccounts(client, fakeAdminAccountsForFakeGroup2.map(({username}) => username)),
        ]);
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

    function generateFakeAccounts()
    {
        for (let i = 0; i < 5; i++)
        {
            fakeAdminAccountsForFakeGroup1.push(new Account(faker.name.firstName() + i, faker.random.alphaNumeric(64)));
            fakeAdminAccountsForFakeGroup2.push(new Account(i + faker.name.firstName(), faker.random.alphaNumeric(64)));
        }
    }

    async function insertFakeGroups()
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
        ]);
    }
});

describe(addAdmins, () =>
{
    const fakeAdminAccounts: Account[] = [];
    beforeAll(async () =>
    {
        generateFakeAdminAccounts();
        [, fakeGroupId] = await Promise.all([
            insertFakeAccounts(client, fakeAdminAccounts),
            insertFakeGroupAndReturnId(client, fakeGroup),
        ]);
        await insertAccountsGroup(client, fakeAdminAccounts.map(({username}) => username), fakeGroupId);
    });

    afterAll(async () =>
    {
        await deleteAdminsGroup(client, fakeAdminAccounts.map(({username}) => username), fakeGroupId);
        await Promise.all([
            deleteAccountsGroup(client, fakeAdminAccounts.map(({username}) => username), fakeGroupId),
            deleteFakeGroupById(client, fakeGroupId),
            deleteFakeAccounts(client, fakeAdminAccounts.map(({username}) => username)),
        ]);
        fakeGroupId = -1;
    });

    it('should add admin accounts', async function ()
    {
        await addAdmins(fakeGroupId, fakeAdminAccounts.map(fakeAccount => fakeAccount.username));
        const fakeAdminAccountsInDatabase = await selectAdminsByGroup(client, fakeGroupId);
        expect(fakeAdminAccountsInDatabase.length).toBe(fakeAdminAccounts.length);
        expect(fakeAdminAccountsInDatabase).toEqual(expect.arrayContaining(fakeAdminAccounts));
    });

    function generateFakeAdminAccounts()
    {
        for (let i = 0; i < 5; i++)
        {
            fakeAdminAccounts.push(new Account(faker.name.firstName() + i, faker.random.alphaNumeric(64)));
        }
    }
});

describe(getRepositoriesById, () =>
{
    let fakeGroup1Id = -1;
    let fakeGroup2Id = -1;
    const fakeRepositoriesForFakeGroup1: Repository[] = [];
    const fakeRepositoriesForFakeGroup2: Repository[] = [];
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

    beforeAll(async () =>
    {
        generateFakeRepositories();
        await Promise.all([
            insertFakeAccount(client, fakeAccount),
            insertFakeRepositories(client, fakeRepositoriesForFakeGroup1),
            insertFakeRepositories(client, fakeRepositoriesForFakeGroup2),
            insertFakeGroups(),
        ]);
        await Promise.all([
            insertRepositoriesGroup(client, fakeRepositoriesForFakeGroup1, fakeGroup1Id),
            insertRepositoriesGroup(client, fakeRepositoriesForFakeGroup2, fakeGroup2Id),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteRepositoriesGroup(client, fakeRepositoriesForFakeGroup1, fakeGroup1Id),
            deleteRepositoriesGroup(client, fakeRepositoriesForFakeGroup2, fakeGroup2Id),
        ]);
        await Promise.all([
            deleteFakeGroupsByIds(client, [fakeGroup1Id, fakeGroup2Id]),
            deleteFakeRepositories(client, fakeRepositoriesForFakeGroup1),
            deleteFakeRepositories(client, fakeRepositoriesForFakeGroup2),
            deleteFakeAccount(client, fakeAccount.username),
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

    function generateFakeRepositories()
    {
        for (let i = 0; i < 5; i++)
        {
            fakeRepositoriesForFakeGroup1.push(new Repository(fakeAccount.username, faker.random.word() + i, faker.lorem.sentence(), faker.random.boolean()));
            fakeRepositoriesForFakeGroup2.push(new Repository(fakeAccount.username, i + faker.random.word(), faker.lorem.sentence(), faker.random.boolean()));
        }
    }

    async function insertFakeGroups()
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
        ]);
    }
});

describe(addRepositories, () =>
{
    const fakeRepositories: Repository[] = [];
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    beforeAll(async () =>
    {
        generateFakeRepositories();
        [, , fakeGroupId] = await Promise.all([
            insertFakeAccount(client, fakeAccount),
            insertFakeRepositories(client, fakeRepositories),
            insertFakeGroupAndReturnId(client, fakeGroup),
        ]);
    });

    afterAll(async () =>
    {
        await deleteRepositoriesGroup(client, fakeRepositories, fakeGroupId);
        await Promise.all([
            deleteFakeGroupById(client, fakeGroupId),
            deleteFakeRepositories(client, fakeRepositories),
            deleteFakeAccount(client, fakeAccount.username),
        ]);
        fakeGroupId = -1;
    });

    it('should add repositories', async function ()
    {
        await addRepositories(fakeGroupId, fakeRepositories);
        const fakeRepositoriesInDatabase = await selectRepositoriesByGroup(client, fakeGroupId);
        expect(fakeRepositoriesInDatabase.length).toBe(fakeRepositories.length);
        expect(fakeRepositoriesInDatabase).toEqual(expect.arrayContaining(fakeRepositories));
    });

    function generateFakeRepositories()
    {
        for (let i = 0; i < 5; i++)
        {
            fakeRepositories.push(
                new Repository(
                    fakeAccount.username,
                    faker.random.word() + i,
                    faker.lorem.sentence(),
                    faker.random.boolean()));
        }
    }
});