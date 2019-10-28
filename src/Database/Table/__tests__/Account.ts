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
    deleteAccountGroup,
    deleteAdminGroup,
    deleteFakeAccount,
    deleteFakeGroupById,
    deleteFakeProfile,
    insertAccountGroup,
    insertAdminGroup,
    insertFakeAccount,
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
        const {rowCount, rows} = await client.query(
            'SELECT * FROM accounts NATURAL JOIN profiles WHERE username=$1',
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
            client.query(
                'SELECT * FROM accounts WHERE username=$1',
                [fakeAccount.username]),
            client.query(
                'SELECT * FROM profiles WHERE username=$1',
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
        await insertFakeAccount(client, fakeAccount1);
        await insertFakeAccount(client, fakeAccount2);
        generateFakeGroups();
        await insertFakeGroups();
        await insertFakeAdminGroups();
    });

    afterAll(async () =>
    {
        await deleteFakeAdminGroups();
        await deleteFakeGroups();
        await deleteFakeAccount(client, fakeAccount1.username);
        await deleteFakeAccount(client, fakeAccount2.username);
    });

    it('should get groups by username', async function ()
    {
        const fakeGroupsForAccount1InDatabase = await getGroupsByUsername(fakeAccount1.username);
        const fakeGroupsForAccount2InDatabase = await getGroupsByUsername(fakeAccount2.username);
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

    async function deleteFakeGroups()
    {
        await Promise.all([
            ...fakeGroupsForAccount1.map(group => deleteFakeGroupById(client, group.id)),
            ...fakeGroupsForAccount2.map(group => deleteFakeGroupById(client, group.id)),
        ]);
    }

    async function insertFakeAdminGroups()
    {
        await Promise.all([
            ...fakeGroupsForAccount1.map(group => insertAccountGroup(client, fakeAccount1.username, group.id)),
            ...fakeGroupsForAccount2.map(group => insertAccountGroup(client, fakeAccount2.username, group.id)),
        ]);
    }

    async function deleteFakeAdminGroups()
    {
        await Promise.all([
            ...fakeGroupsForAccount1.map(group => deleteAccountGroup(client, fakeAccount1.username, group.id)),
            ...fakeGroupsForAccount2.map(group => deleteAccountGroup(client, fakeAccount2.username, group.id)),
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
        await insertFakeAccount(client, fakeAdminAccount1);
        await insertFakeAccount(client, fakeAdminAccount2);
        generateFakeGroups();
        await insertFakeGroups();
        await insertFakeAdminGroups();
    });

    afterAll(async () =>
    {
        await deleteFakeAdminGroups();
        await deleteFakeGroups();
        await deleteFakeAccount(client, fakeAdminAccount1.username);
        await deleteFakeAccount(client, fakeAdminAccount2.username);
    });

    it('should get administrating groups by username', async function ()
    {
        const fakeGroupsForAccount1InDatabase = await getAdministratingGroupsByUsername(fakeAdminAccount1.username);
        const fakeGroupsForAccount2InDatabase = await getAdministratingGroupsByUsername(fakeAdminAccount2.username);
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

    async function deleteFakeGroups()
    {
        await Promise.all([
            ...fakeGroupsForAdminAccount1.map(group => deleteFakeGroupById(client, group.id)),
            ...fakeGroupsForAdminAccount2.map(group => deleteFakeGroupById(client, group.id)),
        ]);
    }

    async function insertFakeAdminGroups()
    {
        await Promise.all([
            ...fakeGroupsForAdminAccount1.map(group => insertAdminGroup(client, fakeAdminAccount1.username, group.id)),
            ...fakeGroupsForAdminAccount2.map(group => insertAdminGroup(client, fakeAdminAccount2.username, group.id)),
        ]);
    }

    async function deleteFakeAdminGroups()
    {
        await Promise.all([
            ...fakeGroupsForAdminAccount1.map(group => deleteAdminGroup(client, fakeAdminAccount1.username, group.id)),
            ...fakeGroupsForAdminAccount2.map(group => deleteAdminGroup(client, fakeAdminAccount2.username, group.id)),
        ]);
    }
});