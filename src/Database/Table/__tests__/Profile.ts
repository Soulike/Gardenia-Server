import {Account, Profile} from '../../../Class';
import faker from 'faker';
import {PoolClient} from 'pg';
import pool from '../../Pool';
import {selectByUsername, update} from '../Profile';
import {
    deleteFakeAccount,
    deleteFakeProfile,
    insertFakeAccount,
    insertFakeProfile,
    selectFakeProfile,
} from '../_TestHelper';

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

describe(selectByUsername, () =>
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
        const modifiedFakeProfile: Omit<Profile, 'avatar' | 'username'> = {
            email: faker.internet.email(),
            nickname: faker.name.firstName(),
        };
        await update(modifiedFakeProfile, {username: fakeProfile.username});
        const fakeProfileCopy = Profile.from({
            ...fakeProfile,
            ...modifiedFakeProfile,
        });
        expect(await selectFakeProfile(client, fakeProfile.username)).toStrictEqual(fakeProfileCopy);
    });
});