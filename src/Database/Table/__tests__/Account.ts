import {create, del, insert, select, update} from '../Account';
import {Account, Profile} from '../../../Class';
import faker from 'faker';
import pool from '../../Pool';
import {PoolClient} from 'pg';

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

describe(select, () =>
{
    const nonexistentFakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

    beforeAll(async () =>
    {
        await insertFakeAccount();
    });

    afterAll(async () =>
    {
        await deleteFakeAccount();
    });

    it('should select account', async function ()
    {
        const account = await select(fakeAccount.username);
        expect(account).toStrictEqual(fakeAccount);
    });

    it('should return null when account does not exists', async function ()
    {
        const account = await select(nonexistentFakeAccount.username);
        expect(account).toBeNull();
    });
});

describe(update, () =>
{
    const modifiedFakeAccount = new Account(fakeAccount.username, faker.random.alphaNumeric(64));

    beforeEach(async () =>
    {
        await insertFakeAccount();
    });

    afterEach(async () =>
    {
        await deleteFakeAccount();
    });

    it('should update account', async function ()
    {
        await update(modifiedFakeAccount);
        expect(await selectFakeAccount()).toStrictEqual(modifiedFakeAccount);
    });

    it('should rollback when error happens', async function ()
    {
        const modifiedFakeAccountWithInvalidHash =
            new Account(fakeAccount.username, faker.random.alphaNumeric(100));
        await expect(update(modifiedFakeAccountWithInvalidHash)).rejects.toThrow();
        expect(await selectFakeAccount()).toStrictEqual(fakeAccount);
    });
});

describe(insert, () =>
{
    afterEach(async () =>
    {
        await deleteFakeAccount();
    });

    it('should insert account', async function ()
    {
        await insert(fakeAccount);
        expect(await selectFakeAccount()).toStrictEqual(fakeAccount);
    });

    it('should throw error when insert the same accounts', async function ()
    {
        await insertFakeAccount();
        await expect(insert(fakeAccount)).rejects.toThrow();
        expect(await selectFakeAccount()).toStrictEqual(fakeAccount);
    });

    it('should rollback when error happens', async function ()
    {
        const fakeAccountWithInvalidHash =
            new Account(fakeAccount.username, faker.random.alphaNumeric(65));
        await expect(insert(fakeAccountWithInvalidHash)).rejects.toThrow();
        expect(await selectFakeAccount()).toBeNull();
    });
});

describe(del, () =>
{
    beforeEach(async () =>
    {
        await insertFakeAccount();
    });

    beforeEach(async () =>
    {
        await deleteFakeAccount();
    });

    it('should delete account', async function ()
    {
        await del(fakeAccount.username);
        expect(await selectFakeAccount()).toBeNull();
    });
});

describe(create, () =>
{
    afterEach(async () =>
    {
        await deleteFakeProfile();
        await deleteFakeAccount();
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

async function insertFakeAccount()
{
    await client.query('START TRANSACTION');
    await client.query(
        'INSERT INTO accounts (username, hash) VALUES ($1, $2)',
        [fakeAccount.username, fakeAccount.hash]);
    await client.query('COMMIT');
}

async function deleteFakeAccount()
{
    await client.query('START TRANSACTION');
    await client.query(
        'DELETE FROM accounts WHERE username=$1',
        [fakeAccount.username]);
    await client.query('COMMIT');
}

async function selectFakeAccount(): Promise<Account | null>
{
    const {rows, rowCount} = await pool.query(
        'SELECT * FROM accounts WHERE username=$1',
        [fakeAccount.username]);
    if (rowCount === 1)
    {
        return Account.from(rows[0]);
    }
    else
    {
        return null;
    }
}

async function deleteFakeProfile()
{
    await client.query('START TRANSACTION');
    await client.query(
        'DELETE FROM profiles WHERE username=$1',
        [fakeAccount.username]);
    await client.query('COMMIT');
}