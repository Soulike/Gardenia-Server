import {
    create,
    deleteByUsername,
    getAdministratingGroupsByUsername,
    getGroupsByUsername,
    insert,
    selectByUsername,
    update,
} from '../Account';
import {Account, Group, Profile} from '../../../Class';
import faker from 'faker';
import pool from '../../Pool';
import {PoolClient} from 'pg';
import {
    deleteAccountGroups,
    deleteAdminGroups,
    deleteFakeAccount,
    deleteFakeAccounts,
    deleteFakeGroupsByIds,
    deleteFakeProfile,
    insertAccountGroups,
    insertAdminGroups,
    insertFakeAccount,
    insertFakeAccounts,
    insertFakeGroupAndReturnId,
    selectFakeAccount,
} from '../_TestHelper';

const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
const fakeProfile = new Profile(fakeAccount.username, faker.name.firstName(), faker.internet.email(), '');
let client: PoolClient;

beforeAll(async () =>
{
    client = await pool.connect();
});

afterAll(() =>
{
    client.release();
});

describe(selectByUsername, () =>
{
    const nonexistentFakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

    beforeAll(async () =>
    {
        await insertFakeAccount(client, fakeAccount);
    });

    afterAll(async () =>
    {
        await deleteFakeAccount(client, fakeAccount.username);
    });

    it('should select account', async function ()
    {
        const account = await selectByUsername(fakeAccount.username);
        expect(account).toStrictEqual(fakeAccount);
    });

    it('should return null when account does not exists', async function ()
    {
        const account = await selectByUsername(nonexistentFakeAccount.username);
        expect(account).toBeNull();
    });
});

describe(update, () =>
{
    beforeEach(async () =>
    {
        await insertFakeAccount(client, fakeAccount);
    });

    afterEach(async () =>
    {
        await deleteFakeAccount(client, fakeAccount.username);
    });

    it('should update account', async function ()
    {
        const modifiedFakeAccount = new Account(fakeAccount.username, faker.random.alphaNumeric(64));
        await update(modifiedFakeAccount);
        expect(await selectFakeAccount(client, fakeAccount.username)).toStrictEqual(modifiedFakeAccount);
    });
});

describe(insert, () =>
{
    afterEach(async () =>
    {
        await deleteFakeAccount(client, fakeAccount.username);
    });

    it('should insert account', async function ()
    {
        await insert(fakeAccount);
        expect(await selectFakeAccount(client, fakeAccount.username)).toStrictEqual(fakeAccount);
    });

    it('should throw error when insert the same accounts', async function ()
    {
        await insertFakeAccount(client, fakeAccount);
        await expect(insert(fakeAccount)).rejects.toThrow();
        expect(await selectFakeAccount(client, fakeAccount.username)).toStrictEqual(fakeAccount);
    });
});

describe(deleteByUsername, () =>
{
    beforeEach(async () =>
    {
        await insertFakeAccount(client, fakeAccount);
    });

    beforeEach(async () =>
    {
        await deleteFakeAccount(client, fakeAccount.username);
    });

    it('should delete account', async function ()
    {
        await deleteByUsername(fakeAccount.username);
        expect(await selectFakeAccount(client, fakeAccount.username)).toBeNull();
    });
});

describe(create, () =>
{
    afterEach(async () =>
    {
        await deleteFakeProfile(client, fakeProfile.username);
        await deleteFakeAccount(client, fakeAccount.username);
    });

    it('should create account and profile', async function ()
    {
        await create(fakeAccount, fakeProfile);
        const {rowCount, rows} = await client.query(`SELECT *
                                                     FROM accounts
                                                              NATURAL JOIN profiles
                                                     WHERE username = $1`,
            [fakeAccount.username]);
        expect(rowCount).toBe(1);
        expect(Account.from(rows[0])).toStrictEqual(fakeAccount);
        expect(Profile.from(rows[0])).toStrictEqual(fakeProfile);
    });

    it('should rollback when error happens', async function ()
    {
        const invalidProfile = Object.assign({}, fakeProfile);
        invalidProfile.username = faker.random.word();
        await expect(create(fakeAccount, invalidProfile)).rejects.toThrow();
        const [{rowCount: accountRowCount}, {rowCount: profileRowCount}] = await Promise.all([
            client.query(`SELECT *
                          FROM accounts
                          WHERE username = $1`,
                [fakeAccount.username]),
            client.query(`SELECT *
                          FROM profiles
                          WHERE username = $1`,
                [invalidProfile.username]),
        ]);
        expect(accountRowCount).toBe(0);
        expect(profileRowCount).toBe(0);
    });
});

describe(getGroupsByUsername, () =>
{
    const fakeAccount1 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeAccount2 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroupsForAccount1: Group[] = [];
    const fakeGroupsForAccount2: Group[] = [];

    beforeAll(async () =>
    {
        generateFakeGroups();
        await Promise.all([
            insertFakeAccounts(client, [fakeAccount1, fakeAccount2]),
            insertFakeGroups(),
        ]);
        await Promise.all([
            insertAccountGroups(client, fakeAccount1.username, fakeGroupsForAccount1.map(({id}) => id)),
            insertAccountGroups(client, fakeAccount2.username, fakeGroupsForAccount2.map(({id}) => id)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteAccountGroups(client, fakeAccount1.username, fakeGroupsForAccount1.map(({id}) => id)),
            deleteAccountGroups(client, fakeAccount2.username, fakeGroupsForAccount2.map(({id}) => id)),
        ]);
        await Promise.all([
            deleteFakeGroupsByIds(client, fakeGroupsForAccount1.map(({id}) => id)),
            deleteFakeGroupsByIds(client, fakeGroupsForAccount2.map(({id}) => id)),
            deleteFakeAccounts(client, [fakeAccount1.username, fakeAccount2.username]),
        ]);
    });

    it('should get groups by username', async function ()
    {
        const [fakeGroupsForAccount1InDatabase, fakeGroupsForAccount2InDatabase] =
            await Promise.all([
                getGroupsByUsername(fakeAccount1.username),
                getGroupsByUsername(fakeAccount2.username),
            ]);
        expect(fakeGroupsForAccount1InDatabase.length).toBe(fakeGroupsForAccount1.length);
        expect(fakeGroupsForAccount1InDatabase).toEqual(expect.arrayContaining(fakeGroupsForAccount1));
        expect(fakeGroupsForAccount2InDatabase.length).toBe(fakeGroupsForAccount2.length);
        expect(fakeGroupsForAccount2InDatabase).toEqual(expect.arrayContaining(fakeGroupsForAccount2));
    });

    function generateFakeGroups()
    {
        for (let i = 0; i < 5; i++)
        {
            fakeGroupsForAccount1.push(new Group(-1, faker.random.word()));
            fakeGroupsForAccount2.push(new Group(-1, faker.random.word()));
        }
    }

    async function insertFakeGroups()
    {
        await Promise.all([
            ...fakeGroupsForAccount1.map(async group =>
            {
                group.id = await insertFakeGroupAndReturnId(client, group);
            }),
            ...fakeGroupsForAccount2.map(async group =>
            {
                group.id = await insertFakeGroupAndReturnId(client, group);
            }),
        ]);
    }
});

describe(getAdministratingGroupsByUsername, () =>
{
    const fakeAdminAccount1 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeAdminAccount2 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroupsForAdminAccount1: Group[] = [];
    const fakeGroupsForAdminAccount2: Group[] = [];

    beforeAll(async () =>
    {
        generateFakeGroups();
        await Promise.all([
            insertFakeAccounts(client, [fakeAdminAccount1, fakeAdminAccount2]),
            insertFakeGroups(),
        ]);
        await Promise.all([
            insertAdminGroups(client, fakeAdminAccount1.username, fakeGroupsForAdminAccount1.map(({id}) => id)),
            insertAdminGroups(client, fakeAdminAccount2.username, fakeGroupsForAdminAccount2.map(({id}) => id)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteAdminGroups(client, fakeAdminAccount1.username, fakeGroupsForAdminAccount1.map(({id}) => id)),
            deleteAdminGroups(client, fakeAdminAccount2.username, fakeGroupsForAdminAccount2.map(({id}) => id)),
        ]);
        await Promise.all([
            deleteFakeGroupsByIds(client, fakeGroupsForAdminAccount1.map(({id}) => id)),
            deleteFakeGroupsByIds(client, fakeGroupsForAdminAccount2.map(({id}) => id)),
            deleteFakeAccounts(client, [fakeAdminAccount1.username, fakeAdminAccount2.username]),
        ]);
    });

    it('should get administrating groups by username', async function ()
    {
        const [fakeGroupsForAccount1InDatabase, fakeGroupsForAccount2InDatabase] =
            await Promise.all([
                getAdministratingGroupsByUsername(fakeAdminAccount1.username),
                getAdministratingGroupsByUsername(fakeAdminAccount2.username),
            ]);
        expect(fakeGroupsForAccount1InDatabase.length).toBe(fakeGroupsForAdminAccount1.length);
        expect(fakeGroupsForAccount1InDatabase).toEqual(expect.arrayContaining(fakeGroupsForAdminAccount1));
        expect(fakeGroupsForAccount2InDatabase.length).toBe(fakeGroupsForAdminAccount2.length);
        expect(fakeGroupsForAccount2InDatabase).toEqual(expect.arrayContaining(fakeGroupsForAdminAccount2));
    });

    function generateFakeGroups()
    {
        for (let i = 0; i < 5; i++)
        {
            fakeGroupsForAdminAccount1.push(new Group(-1, faker.random.word()));
            fakeGroupsForAdminAccount2.push(new Group(-1, faker.random.word()));
        }
    }

    async function insertFakeGroups()
    {
        await Promise.all([
            ...fakeGroupsForAdminAccount1.map(async group =>
            {
                group.id = await insertFakeGroupAndReturnId(client, group);
            }),
            ...fakeGroupsForAdminAccount2.map(async group =>
            {
                group.id = await insertFakeGroupAndReturnId(client, group);
            }),
        ]);
    }
});