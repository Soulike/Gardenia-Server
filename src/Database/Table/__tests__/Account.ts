import {
    addAdministratingGroups,
    addToGroups,
    create,
    deleteByUsername,
    getAdministratingGroupByUsernameAndGroupId,
    getAdministratingGroupByUsernameAndGroupName,
    getAdministratingGroupsByUsername,
    getGroupByUsernameAndGroupName,
    getGroupsByUsername,
    insert,
    removeAdministratingGroups,
    removeFromGroups,
    selectByUsername,
    update,
} from '../Account';
import * as GroupTable from '../Group';
import * as ProfileTable from '../Profile';
import {Account, Group, Profile} from '../../../Class';
import faker from 'faker';
import pool from '../../Pool';
import {executeTransaction} from '../../Function';

describe(`${selectByUsername.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const nonexistentFakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

    beforeAll(async () =>
    {
        await insert(fakeAccount);
    });

    afterAll(async () =>
    {
        await deleteByUsername(fakeAccount.username);
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

describe(`${update.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

    beforeEach(async () =>
    {
        await insert(fakeAccount);
    });

    afterEach(async () =>
    {
        await deleteByUsername(fakeAccount.username);
    });

    it('should update account', async function ()
    {
        const modifiedFakeAccount = new Account(fakeAccount.username, faker.random.alphaNumeric(64));
        await update(modifiedFakeAccount, {username: modifiedFakeAccount.username});
        expect(await selectByUsername(fakeAccount.username)).toStrictEqual(modifiedFakeAccount);
    });
});

describe(`${insert.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

    afterEach(async () =>
    {
        await deleteByUsername(fakeAccount.username);
    });

    it('should insert account', async function ()
    {
        await insert(fakeAccount);
        expect(await selectByUsername(fakeAccount.username)).toStrictEqual(fakeAccount);
    });

    it('should throw error when insert the same accounts', async function ()
    {
        await insert(fakeAccount);
        await expect(insert(fakeAccount)).rejects.toThrow();
        expect(await selectByUsername(fakeAccount.username)).toStrictEqual(fakeAccount);
    });
});

describe(`${deleteByUsername.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

    beforeEach(async () =>
    {
        await insert(fakeAccount);
    });

    afterEach(async () =>
    {
        const client = await pool.connect();
        try
        {
            await executeTransaction(client, async client =>
            {
                await client.query(`DELETE
                                    FROM accounts
                                    WHERE username = $1`, [fakeAccount.username]);
            });
        }
        finally
        {
            client.release();
        }
    });

    it('should delete account', async function ()
    {
        await deleteByUsername(fakeAccount.username);
        expect(await selectByUsername(fakeAccount.username)).toBeNull();
    });
});

describe(`${create.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeProfile = new Profile(fakeAccount.username, faker.name.firstName(), faker.internet.email(), '');

    afterEach(async () =>
    {
        await deleteByUsername(fakeAccount.username);   // Profile table is 'ON DELETE CASCADE'
    });

    it('should create account and profile', async function ()
    {
        await create(fakeAccount, fakeProfile);
        expect(await ProfileTable.selectByUsername(fakeAccount.username)).toEqual(fakeProfile);
    });

    it('should rollback when error happens', async function ()
    {
        const invalidProfile = Profile.from({...fakeProfile, username: faker.random.word()});
        await expect(create(fakeAccount, invalidProfile)).rejects.toThrow();
        expect(await selectByUsername(fakeAccount.username)).toBeNull();
        expect(await ProfileTable.selectByUsername(fakeAccount.username)).toBeNull();
    });
});

describe(`${getGroupsByUsername.name}`, () =>
{
    const fakeAccount1 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeAccount2 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroupsForAccount1: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];
    const fakeGroupsForAccount2: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];

    async function insertAllFakeGroupsAndSetTheirIds()
    {
        return Promise.all([...fakeGroupsForAccount1, ...fakeGroupsForAccount2].map(async group =>
        {
            const {id, ...rest} = group;
            group.id = await GroupTable.insertAndReturnId(rest);
        }));
    }

    beforeAll(async () =>
    {
        await Promise.all([
            insert(fakeAccount1),
            insert(fakeAccount2),
            insertAllFakeGroupsAndSetTheirIds(),
        ]);
        await Promise.all([
            ...fakeGroupsForAccount1
                .map(async ({id}) => await GroupTable.addAccounts(id, [fakeAccount1.username])),
            ...fakeGroupsForAccount2
                .map(async ({id}) => await GroupTable.addAccounts(id, [fakeAccount2.username])),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([...fakeGroupsForAccount1, ...fakeGroupsForAccount2]
            .map(async ({id}) => await GroupTable.deleteById(id)));
        await Promise.all([
            deleteByUsername(fakeAccount1.username),
            deleteByUsername(fakeAccount1.username),
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
});

describe(`${getAdministratingGroupsByUsername.name}`, () =>
{
    const fakeAdminAccount1 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeAdminAccount2 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroupsForAdminAccount1: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];
    const fakeGroupsForAdminAccount2: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];

    async function insertFakeGroupsAndSetTheirId()
    {
        await Promise.all([...fakeGroupsForAdminAccount1, ...fakeGroupsForAdminAccount2].map(async group =>
        {
            const {id, ...rest} = group;
            group.id = await GroupTable.insertAndReturnId(rest);
        }));
    }

    beforeAll(async () =>
    {
        await Promise.all([
            insert(fakeAdminAccount1),
            insert(fakeAdminAccount2),
            insertFakeGroupsAndSetTheirId(),
        ]);
        await Promise.all([
            addToGroups(fakeAdminAccount1.username, fakeGroupsForAdminAccount1.map(({id}) => id)),
            addToGroups(fakeAdminAccount2.username, fakeGroupsForAdminAccount2.map(({id}) => id)),
        ]);
        await Promise.all([
            addAdministratingGroups(fakeAdminAccount1.username, fakeGroupsForAdminAccount1.map(({id}) => id)),
            addAdministratingGroups(fakeAdminAccount2.username, fakeGroupsForAdminAccount2.map(({id}) => id)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            ...[...fakeGroupsForAdminAccount1, ...fakeGroupsForAdminAccount2]
                .map(({id}) => GroupTable.deleteById(id)),
            deleteByUsername(fakeAdminAccount1.username),
            deleteByUsername(fakeAdminAccount2.username),
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
});

describe(`${getGroupByUsernameAndGroupName.name}`, () =>
{
    const fakeAccount1 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeAccount2 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroupsForAccount1: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];
    const fakeGroupsForAccount2: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];

    beforeAll(async () =>
    {
        await Promise.all([
            insert(fakeAccount1),
            insert(fakeAccount2),
            insertFakeGroupsAndSetTheirId(),
        ]);
        await Promise.all([
            addToGroups(fakeAccount1.username, fakeGroupsForAccount1.map(({id}) => id)),
            addToGroups(fakeAccount2.username, fakeGroupsForAccount2.map(({id}) => id)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            ...[...fakeGroupsForAccount1, ...fakeGroupsForAccount2]
                .map(({id}) => GroupTable.deleteById(id)),
            deleteByUsername(fakeAccount1.username),
            deleteByUsername(fakeAccount2.username),
        ]);
    });

    async function insertFakeGroupsAndSetTheirId()
    {
        await Promise.all([...fakeGroupsForAccount1, ...fakeGroupsForAccount2].map(async group =>
        {
            group.id = await GroupTable.insertAndReturnId(group);
        }));
    }

    it('should get groups by username and the name of group', async function ()
    {
        const [fakeGroup1, fakeGroup2] =
            await Promise.all([
                getGroupByUsernameAndGroupName(fakeAccount1.username, fakeGroupsForAccount1[0].name),
                getGroupByUsernameAndGroupName(fakeAccount2.username, fakeGroupsForAccount2[1].name),
            ]);
        expect(fakeGroup1).toStrictEqual(fakeGroupsForAccount1[0]);
        expect(fakeGroup2).toStrictEqual(fakeGroupsForAccount2[1]);
    });

    it('should return null when group does not exist', async function ()
    {
        const fakeGroup = await getGroupByUsernameAndGroupName(fakeAccount1.username, fakeGroupsForAccount2[1].name);
        expect(fakeGroup).toBeNull();
    });
});

describe(`${getAdministratingGroupByUsernameAndGroupName.name}`, () =>
{
    const fakeAccount1 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeAccount2 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroupsForAccount1: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];
    const fakeGroupsForAccount2: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];

    async function insertFakeGroupsAndSetTheirIds()
    {
        await Promise.all([...fakeGroupsForAccount1, ...fakeGroupsForAccount2].map(async group =>
        {
            group.id = await GroupTable.insertAndReturnId(group);
        }));
    }

    beforeAll(async () =>
    {
        await Promise.all([
            insert(fakeAccount1),
            insert(fakeAccount2),
            insertFakeGroupsAndSetTheirIds(),
        ]);
        await Promise.all([
            addToGroups(fakeAccount1.username, fakeGroupsForAccount1.map(({id}) => id)),
            addToGroups(fakeAccount2.username, fakeGroupsForAccount2.map(({id}) => id)),
        ]);
        await Promise.all([
            addAdministratingGroups(fakeAccount1.username, fakeGroupsForAccount1.map(({id}) => id)),
            addAdministratingGroups(fakeAccount2.username, fakeGroupsForAccount2.map(({id}) => id)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            [...fakeGroupsForAccount1, ...fakeGroupsForAccount2].map(({id}) => GroupTable.deleteById(id)),
            deleteByUsername(fakeAccount1.username),
            deleteByUsername(fakeAccount2.username),
        ]);
    });

    it('should get groups by username and the name of group', async function ()
    {
        const [fakeGroup1, fakeGroup2] =
            await Promise.all([
                getAdministratingGroupByUsernameAndGroupName(fakeAccount1.username, fakeGroupsForAccount1[0].name),
                getAdministratingGroupByUsernameAndGroupName(fakeAccount2.username, fakeGroupsForAccount2[1].name),
            ]);
        expect(fakeGroup1).toStrictEqual(fakeGroupsForAccount1[0]);
        expect(fakeGroup2).toStrictEqual(fakeGroupsForAccount2[1]);
    });

    it('should return null when group does not exist', async function ()
    {
        const fakeGroup = await getAdministratingGroupByUsernameAndGroupName(fakeAccount1.username, fakeGroupsForAccount2[1].name);
        expect(fakeGroup).toBeNull();
    });
});

describe(`${getAdministratingGroupByUsernameAndGroupId.name}`, () =>
{
    const fakeAccount1 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeAccount2 = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroupsForAccount1: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];
    const fakeGroupsForAccount2: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];

    async function insertFakeGroups()
    {
        await Promise.all(
            [...fakeGroupsForAccount1, ...fakeGroupsForAccount2].map(async group =>
            {
                group.id = await GroupTable.insertAndReturnId(group);
            }));
    }

    beforeAll(async () =>
    {
        await Promise.all([
            insert(fakeAccount1),
            insert(fakeAccount2),
            insertFakeGroups(),
        ]);
        await Promise.all([
            addToGroups(fakeAccount1.username, fakeGroupsForAccount1.map(({id}) => id)),
            addToGroups(fakeAccount2.username, fakeGroupsForAccount2.map(({id}) => id)),
        ]);
        await Promise.all([
            addAdministratingGroups(fakeAccount1.username, fakeGroupsForAccount1.map(({id}) => id)),
            addAdministratingGroups(fakeAccount2.username, fakeGroupsForAccount2.map(({id}) => id)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            ...[...fakeGroupsForAccount1, ...fakeGroupsForAccount2]
                .map(({id}) => GroupTable.deleteById(id)),
            deleteByUsername(fakeAccount1.username),
            deleteByUsername(fakeAccount2.username),
        ]);
    });

    it('should get groups by username and the id of group', async function ()
    {
        const [fakeGroup1, fakeGroup2] =
            await Promise.all([
                getAdministratingGroupByUsernameAndGroupId(fakeAccount1.username, fakeGroupsForAccount1[0].id),
                getAdministratingGroupByUsernameAndGroupId(fakeAccount2.username, fakeGroupsForAccount2[1].id),
            ]);
        expect(fakeGroup1).toStrictEqual(fakeGroupsForAccount1[0]);
        expect(fakeGroup2).toStrictEqual(fakeGroupsForAccount2[1]);
    });

    it('should return null when group does not exist', async function ()
    {
        const fakeGroup = await getAdministratingGroupByUsernameAndGroupId(fakeAccount1.username, fakeGroupsForAccount2[1].id);
        expect(fakeGroup).toBeNull();
    });
});

describe(`${addToGroups.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroups = [
        new Group(faker.random.number(), faker.random.word()),
        new Group(faker.random.number(), faker.random.word()),
    ];

    beforeEach(async () =>
    {
        await Promise.all([
            insert(fakeAccount),
            ...fakeGroups.map(async group =>
            {
                const {id, ...rest} = group;
                group.id = await GroupTable.insertAndReturnId(rest);
            }),
        ]);
    });

    afterEach(async () =>
    {
        await Promise.all([
            deleteByUsername(fakeAccount.username),
            ...fakeGroups.map(async group =>
            {
                const {id} = group;
                await GroupTable.deleteById(id);
            }),
        ]);
    });

    it('should add account to groups', async function ()
    {
        await addToGroups(fakeAccount.username, fakeGroups.map(({id}) => id));
        const groupsInDatabase = await getGroupsByUsername(fakeAccount.username);
        expect(groupsInDatabase.length).toBe(2);
        expect(groupsInDatabase).toEqual(expect.arrayContaining(fakeGroups));
    });

    it('should handle database error', async function ()
    {
        // add to a nonexistent group
        await expect(
            addToGroups(fakeAccount.username, [...fakeGroups.map(({id}) => id), -1]))
            .rejects.toThrow();
        const groupsInDatabase = await getGroupsByUsername(fakeAccount.username);
        expect(groupsInDatabase.length).toBe(0);    // no group should be added
    });
});

describe(`${removeFromGroups.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroups = [
        new Group(faker.random.number(), faker.random.word()),
        new Group(faker.random.number(), faker.random.word()),
    ];

    beforeEach(async () =>
    {
        await Promise.all([
            insert(fakeAccount),
            ...fakeGroups.map(async group =>
            {
                const {id, ...rest} = group;
                group.id = await GroupTable.insertAndReturnId(rest);
            }),
        ]);
        await addToGroups(fakeAccount.username, fakeGroups.map(({id}) => id));
    });

    afterEach(async () =>
    {
        await Promise.all([
            deleteByUsername(fakeAccount.username),
            ...fakeGroups.map(async group =>
            {
                const {id} = group;
                await GroupTable.deleteById(id);
            }),
        ]);
    });

    it('should remove account from groups', async function ()
    {
        await removeFromGroups(fakeAccount.username, fakeGroups.map(({id}) => id));
        const groupsInDatabase = await getGroupsByUsername(fakeAccount.username);
        expect(groupsInDatabase.length).toBe(0);
    });

    it('should handle database error', async function ()
    {
        // remove from a group with invalid id
        await expect(
            removeFromGroups(fakeAccount.username, [...fakeGroups.map(({id}) => id), Number.MAX_VALUE]))
            .rejects.toThrow();
        const groupsInDatabase = await getGroupsByUsername(fakeAccount.username);
        expect(groupsInDatabase.length).toBe(2);    // no group should be removed
        expect(groupsInDatabase).toEqual(expect.arrayContaining(fakeGroups));
    });
});

describe(`${addAdministratingGroups.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroups = [
        new Group(faker.random.number(), faker.random.word()),
        new Group(faker.random.number(), faker.random.word()),
    ];

    beforeEach(async () =>
    {
        await Promise.all([
            insert(fakeAccount),
            ...fakeGroups.map(async group =>
            {
                const {id, ...rest} = group;
                group.id = await GroupTable.insertAndReturnId(rest);
            }),
        ]);
        await addToGroups(fakeAccount.username, fakeGroups.map(({id}) => id));
    });

    afterEach(async () =>
    {
        await Promise.all([
            deleteByUsername(fakeAccount.username),
            ...fakeGroups.map(async group =>
            {
                const {id} = group;
                await GroupTable.deleteById(id);
            }),
        ]);
    });

    it('should add administrating groups for account', async function ()
    {
        await addAdministratingGroups(fakeAccount.username, fakeGroups.map(({id}) => id));
        const groupsInDatabase = await getAdministratingGroupsByUsername(fakeAccount.username);
        expect(groupsInDatabase.length).toBe(2);
        expect(groupsInDatabase).toEqual(expect.arrayContaining(fakeGroups));
    });

    it('should handle database error', async function ()
    {
        // add to a nonexistent group
        await expect(
            addAdministratingGroups(fakeAccount.username, [...fakeGroups.map(({id}) => id), -1]))
            .rejects.toThrow();
        const groupsInDatabase = await getAdministratingGroupsByUsername(fakeAccount.username);
        expect(groupsInDatabase.length).toBe(0);    // no group should be added
    });
});

describe(`${removeAdministratingGroups.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeGroups = [
        new Group(faker.random.number(), faker.random.word()),
        new Group(faker.random.number(), faker.random.word()),
    ];

    beforeEach(async () =>
    {
        await Promise.all([
            insert(fakeAccount),
            ...fakeGroups.map(async group =>
            {
                const {id, ...rest} = group;
                group.id = await GroupTable.insertAndReturnId(rest);
            }),
        ]);
        await addToGroups(fakeAccount.username, fakeGroups.map(({id}) => id));
        await addAdministratingGroups(fakeAccount.username, fakeGroups.map(({id}) => id));
    });

    afterEach(async () =>
    {
        await Promise.all([
            deleteByUsername(fakeAccount.username),
            ...fakeGroups.map(async group =>
            {
                const {id} = group;
                await GroupTable.deleteById(id);
            }),
        ]);
    });

    it('should remove administrating groups for account', async function ()
    {
        await removeAdministratingGroups(fakeAccount.username, fakeGroups.map(({id}) => id));
        const groupsInDatabase = await getAdministratingGroupsByUsername(fakeAccount.username);
        expect(groupsInDatabase.length).toBe(0);
    });

    it('should handle database error', async function ()
    {
        // remove from a group with invalid id
        await expect(
            removeAdministratingGroups(fakeAccount.username, [...fakeGroups.map(({id}) => id), Number.MAX_VALUE]))
            .rejects.toThrow();
        const groupsInDatabase = await getAdministratingGroupsByUsername(fakeAccount.username);
        expect(groupsInDatabase.length).toBe(2);    // no group should be removed
        expect(groupsInDatabase).toEqual(expect.arrayContaining(fakeGroups));
    });
});