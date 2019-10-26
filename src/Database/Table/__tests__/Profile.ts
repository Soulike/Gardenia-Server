import {Account, Profile} from '../../../Class';
import faker from 'faker';
import {Client, PoolClient} from 'pg';
import pool from '../../Pool';
import {select, update} from '../Profile';
import {deleteFakeAccount, insertFakeAccount} from './Account';

const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
const fakeProfile = new Profile(fakeAccount.username, faker.name.firstName(), faker.internet.email(), '');
let client: PoolClient;

beforeAll(async () =>
{
    client = await pool.connect();
    await insertFakeAccount(client, fakeAccount);
});

afterAll(async () =>
{
    await deleteFakeAccount(client, fakeAccount.username);
    client.release();
});

describe(select, () =>
{
    beforeAll(async () =>
    {
        await insertFakeProfile(client, fakeProfile);
    });

    afterAll(async () =>
    {
        await deleteFakeProfile(client, fakeProfile.username);
    });

    it('should select profile', async function ()
    {
        const profile = await select(fakeProfile.username);
        expect(profile).toStrictEqual(fakeProfile);
    });

    it('should return null when profile does not exists', async function ()
    {
        const nonexistentFakeProfile = new Profile(faker.name.firstName(), faker.name.firstName(), faker.internet.email(), '');
        const profile = await select(nonexistentFakeProfile.username);
        expect(profile).toBeNull();
    });
});

describe(update, () =>
{
    beforeEach(async () =>
    {
        await insertFakeProfile(client, fakeProfile);
    });

    afterEach(async () =>
    {
        await deleteFakeProfile(client, fakeProfile.username);
    });

    it('should update profile', async function ()
    {
        const modifiedFakeProfile = Profile.from(fakeProfile);
        modifiedFakeProfile.email = faker.internet.email();
        await update(modifiedFakeProfile);
        expect(await selectFakeProfile(client, fakeProfile.username)).toStrictEqual(modifiedFakeProfile);
    });
});

export async function insertFakeProfile(client: Client | PoolClient, profile: Profile)
{
    await client.query('START TRANSACTION');
    await client.query(
        'INSERT INTO profiles VALUES ($1,$2, $3, $4)',
        [profile.username, profile.nickname, profile.email, profile.avatar]);
    await client.query('COMMIT');
}

export async function selectFakeProfile(client: Client | PoolClient, username: Profile['username'])
{
    const {rows, rowCount} = await client.query(
        'SELECT * FROM profiles WHERE username=$1',
        [username]);
    if (rowCount === 1)
    {
        return Profile.from(rows[0]);
    }
    else
    {
        return null;
    }
}

export async function deleteFakeProfile(client: Client | PoolClient, username: Profile['username'])
{
    await client.query('START TRANSACTION');
    await client.query(
        'DELETE FROM profiles WHERE username=$1',
        [username]);
    await client.query('COMMIT');
}