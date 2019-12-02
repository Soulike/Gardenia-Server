import {Account, Profile} from '../../../Class';
import faker from 'faker';
import {deleteByUsername, insert, selectByUsername, update} from '../Profile';
import * as AccountTable from '../Account';
import pool from '../../Pool';
import {executeTransaction} from '../../Function';

const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

beforeAll(async () =>
{
    await AccountTable.insert(fakeAccount);
});

afterAll(async () =>
{
    await AccountTable.deleteByUsername(fakeAccount.username);  // Profile is `DELETE ON CASCADE`
});

describe(`${selectByUsername.name}`, () =>
{
    const fakeProfile = new Profile(fakeAccount.username, faker.name.firstName(), faker.internet.email(), '');

    beforeAll(async () =>
    {
        await insert(fakeProfile);
    });

    afterAll(async () =>
    {
        await deleteByUsername(fakeProfile.username);
    });

    it('should select profile', async function ()
    {
        const profile = await selectByUsername(fakeProfile.username);
        expect(profile).toStrictEqual(fakeProfile);
    });

    it('should return null when profile does not exists', async function ()
    {
        const nonexistentFakeProfile = new Profile(faker.name.firstName(), faker.name.firstName(), faker.internet.email(), '');
        const profile = await selectByUsername(nonexistentFakeProfile.username);
        expect(profile).toBeNull();
    });
});

describe(`${update.name}`, () =>
{
    const fakeProfile = new Profile(fakeAccount.username, faker.name.firstName(), faker.internet.email(), '');

    beforeEach(async () =>
    {
        await insert(fakeProfile);
    });

    afterAll(async () =>
    {
        await deleteByUsername(fakeProfile.username);
    });

    it('should update profile', async function ()
    {
        const modifiedFakeProfile: Omit<Profile, 'avatar' | 'username'> = {
            email: faker.internet.email(),
            nickname: faker.name.firstName(),
        };
        await update(modifiedFakeProfile, {username: fakeProfile.username});
        const fakeProfileCopy = Profile.from({
            ...fakeProfile,
            ...modifiedFakeProfile,
        });
        expect(await selectByUsername(fakeProfile.username)).toStrictEqual(fakeProfileCopy);
    });
});

describe(`${deleteByUsername.name}`, () =>
{
    const fakeProfile = new Profile(fakeAccount.username, faker.name.firstName(), faker.internet.email(), '');

    beforeEach(async () =>
    {
        await insert(fakeProfile);
    });

    afterEach(async () =>
    {
        const client = await pool.connect();
        try
        {
            await executeTransaction(client, async client =>
            {
                await client.query(`DELETE
                                    FROM profiles
                                    WHERE username = $1`, [fakeProfile.username]);
            });
        }
        finally
        {
            client.release();
        }
    });

    it('should delete profile by username', async function ()
    {
        await deleteByUsername(fakeProfile.username);
        expect(await selectByUsername(fakeProfile.username)).toBeNull();
    });
});

describe(`${insert.name}`, () =>
{
    const fakeProfile = new Profile(fakeAccount.username, faker.name.firstName(), faker.internet.email(), '');
    const fakeOthersProfile = new Profile(faker.random.word(), faker.name.firstName(), faker.internet.email(), '');

    afterEach(async () =>
    {
        const client = await pool.connect();
        try
        {
            await executeTransaction(client, async client =>
            {
                await client.query(`DELETE
                                    FROM profiles
                                    WHERE username = $1`, [fakeProfile.username]);
            });
        }
        finally
        {
            client.release();
        }
    });

    it('should insert profile', async function ()
    {
        await insert(fakeProfile);
        expect(await selectByUsername(fakeAccount.username)).toEqual(fakeProfile);
    });

    it('should throw error when username does not exist in Account table', async function ()
    {
        await expect(insert(fakeOthersProfile)).rejects.toThrow();
    });
});