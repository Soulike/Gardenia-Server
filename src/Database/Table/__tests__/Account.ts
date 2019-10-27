import {create, deleteByUsername, insert, selectByUsername, update} from '../Account';
import {Account, Profile} from '../../../Class';
import faker from 'faker';
import pool from '../../Pool';
import {PoolClient} from 'pg';
import {deleteFakeAccount, deleteFakeProfile, insertFakeAccount, selectFakeAccount} from '../_TestHelper';

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