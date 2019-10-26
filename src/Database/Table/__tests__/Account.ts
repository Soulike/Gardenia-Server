import {insert, select, update} from '../Account';
import {Account} from '../../../Class';
import faker from 'faker';
import pool from '../../Pool';
import {PoolClient} from 'pg';

const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
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
        const {rows, rowCount} = await pool.query(
            'SELECT * FROM accounts WHERE username=$1',
            [fakeAccount.username]);
        expect(rowCount).toBe(1);
        if (rowCount === 1)
        {
            expect(Account.from(rows[0])).toStrictEqual(modifiedFakeAccount);
        }
    });

    it('should rollback when error happens', async function ()
    {
        const modifiedFakeAccountWithInvalidHash =
            new Account(fakeAccount.username, faker.random.alphaNumeric(100));
        await expect(update(modifiedFakeAccountWithInvalidHash)).rejects.toThrow();
        const {rows, rowCount} = await pool.query(
            'SELECT * FROM accounts WHERE username=$1',
            [fakeAccount.username]);
        expect(rowCount).toBe(1);
        if (rowCount === 1)
        {
            expect(Account.from(rows[0])).toStrictEqual(fakeAccount);
        }
    });
});

describe(insert, () =>
{
    it('should insert account', async function ()
    {
        await insert(fakeAccount);
        const {rows, rowCount} = await pool.query(
            'SELECT * FROM accounts WHERE username=$1',
            [fakeAccount.username]);
        expect(rowCount).toBe(1);
        if (rowCount === 1)
        {
            expect(Account.from(rows[0])).toStrictEqual(fakeAccount);
        }
        await deleteFakeAccount();
    });

    it('should throw error when insert the same accounts', async function ()
    {
        await insertFakeAccount();
        await expect(insert(fakeAccount)).rejects.toThrow();
        const {rowCount} = await pool.query(
            'SELECT * FROM accounts WHERE username=$1',
            [fakeAccount.username]);
        expect(rowCount).toBe(1);
        await deleteFakeAccount();
    });

    it('should rollback when error happens', async function ()
    {
        const fakeAccountWithInvalidHash =
            new Account(fakeAccount.username, faker.random.alphaNumeric(65));
        await expect(insert(fakeAccountWithInvalidHash)).rejects.toThrow();
        const {rowCount} = await pool.query(
            'SELECT * FROM accounts WHERE username=$1',
            [fakeAccount.username]);
        expect(rowCount).toBe(0);
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