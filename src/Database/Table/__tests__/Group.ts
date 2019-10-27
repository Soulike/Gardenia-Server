import {
    addAccounts,
    addAdmins,
    addRepositories,
    deleteById,
    getAccountsById,
    getAdminsById,
    getRepositoriesById,
    insertAndReturnId,
    selectById,
    update,
} from '../Group';
import {PoolClient} from 'pg';
import {Account, Group, Repository} from '../../../Class';
import faker from 'faker';
import pool from '../../Pool';
import {
    deleteAccountGroup,
    deleteAdminGroup,
    deleteFakeAccount,
    deleteFakeGroupById,
    deleteFakeRepository,
    deleteRepositoryGroup,
    insertAccountGroup,
    insertAdminGroup,
    insertFakeAccount,
    insertFakeGroupAndReturnId,
    insertFakeRepository,
    insertRepositoryGroup,
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
        await insertAllFakeAccounts();
        await insertFakeGroups();
        await insertAccountGroups();
    });

    afterAll(async () =>
    {
        await deleteAccountGroups();
        await deleteFakeGroups();
        await deleteAllFakeAccounts();
    });

    it('should get accounts by id', async function ()
    {
        const fakeAccountsForFakeGroup1InDatabase = await getAccountsById(fakeGroup1Id);
        expect(fakeAccountsForFakeGroup1InDatabase.length).toBe(fakeAccountsForFakeGroup1.length);
        expect(fakeAccountsForFakeGroup1InDatabase)
            .toEqual(expect.arrayContaining(fakeAccountsForFakeGroup1));
        const fakeAccountsForFakeGroup2InDatabase = await getAccountsById(fakeGroup2Id);
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

    async function insertAllFakeAccounts()
    {
        await Promise.all([
            ...fakeAccountsForFakeGroup1.map(fakeAccount => insertFakeAccount(client, fakeAccount)),
            ...fakeAccountsForFakeGroup2.map(fakeAccount => insertFakeAccount(client, fakeAccount)),
        ]);
    }

    async function insertFakeGroups()
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
        ]);
    }

    async function insertAccountGroups()
    {
        await Promise.all([
            ...fakeAccountsForFakeGroup1.map(fakeAccount => insertAccountGroup(client, fakeAccount.username, fakeGroup1Id)),
            ...fakeAccountsForFakeGroup2.map(fakeAccount => insertAccountGroup(client, fakeAccount.username, fakeGroup2Id)),
        ]);
    }

    async function deleteAllFakeAccounts()
    {
        await Promise.all([
            ...fakeAccountsForFakeGroup1.map(fakeAccount => deleteFakeAccount(client, fakeAccount.username)),
            ...fakeAccountsForFakeGroup2.map(fakeAccount => deleteFakeAccount(client, fakeAccount.username)),
        ]);
    }

    async function deleteFakeGroups()
    {
        await Promise.all([
            deleteFakeGroupById(client, fakeGroup1Id),
            deleteFakeGroupById(client, fakeGroup2Id),
        ]);
    }

    async function deleteAccountGroups()
    {
        await Promise.all([
            ...fakeAccountsForFakeGroup1.map(fakeAccount => deleteAccountGroup(client, fakeAccount.username, fakeGroup1Id)),
            ...fakeAccountsForFakeGroup2.map(fakeAccount => deleteAccountGroup(client, fakeAccount.username, fakeGroup2Id)),
        ]);
    }
});

describe(addAccounts, () =>
{
    const fakeAccounts: Account[] = [];
    beforeAll(async () =>
    {
        generateFakeAccounts();
        await insertAllFakeAccounts();
        fakeGroupId = await insertFakeGroupAndReturnId(client, fakeGroup);
    });

    afterAll(async () =>
    {
        await deleteAllAccountGroups();
        await deleteFakeGroupById(client, fakeGroupId);
        fakeGroupId = -1;
        await deleteAllFakeAccounts();
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

    async function insertAllFakeAccounts()
    {
        await Promise.all(fakeAccounts.map(fakeAccount => insertFakeAccount(client, fakeAccount)));
    }

    async function deleteAllFakeAccounts()
    {
        await Promise.all(fakeAccounts.map(fakeAccount => deleteFakeAccount(client, fakeAccount.username)));
    }

    async function deleteAllAccountGroups()
    {
        await Promise.all(fakeAccounts.map(fakeAccount => deleteAccountGroup(client, fakeAccount.username, fakeGroupId)));
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
        await insertAllFakeAdminAccounts();
        await insertFakeGroups();
        await insertAdminGroups();
    });

    afterAll(async () =>
    {
        await deleteAdminGroups();
        await deleteFakeGroups();
        await deleteAllFakeAdminAccounts();
    });

    it('should get admin accounts by id', async function ()
    {
        const fakeAdminAccountsForFakeGroup1InDatabase = await getAdminsById(fakeGroup1Id);
        expect(fakeAdminAccountsForFakeGroup1InDatabase.length).toBe(fakeAdminAccountsForFakeGroup1.length);
        expect(fakeAdminAccountsForFakeGroup1InDatabase)
            .toEqual(expect.arrayContaining(fakeAdminAccountsForFakeGroup1));
        const fakeAdminAccountsForFakeGroup2InDatabase = await getAdminsById(fakeGroup2Id);
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

    async function insertAllFakeAdminAccounts()
    {
        await Promise.all([
            ...fakeAdminAccountsForFakeGroup1.map(fakeAccount => insertFakeAccount(client, fakeAccount)),
            ...fakeAdminAccountsForFakeGroup2.map(fakeAccount => insertFakeAccount(client, fakeAccount)),
        ]);
    }

    async function insertFakeGroups()
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
        ]);
    }

    async function insertAdminGroups()
    {
        await Promise.all([
            ...fakeAdminAccountsForFakeGroup1.map(fakeAccount => insertAdminGroup(client, fakeAccount.username, fakeGroup1Id)),
            ...fakeAdminAccountsForFakeGroup2.map(fakeAccount => insertAdminGroup(client, fakeAccount.username, fakeGroup2Id)),
        ]);
    }

    async function deleteAllFakeAdminAccounts()
    {
        await Promise.all([
            ...fakeAdminAccountsForFakeGroup1.map(fakeAccount => deleteFakeAccount(client, fakeAccount.username)),
            ...fakeAdminAccountsForFakeGroup2.map(fakeAccount => deleteFakeAccount(client, fakeAccount.username)),
        ]);
    }

    async function deleteFakeGroups()
    {
        await Promise.all([
            deleteFakeGroupById(client, fakeGroup1Id),
            deleteFakeGroupById(client, fakeGroup2Id),
        ]);
    }

    async function deleteAdminGroups()
    {
        await Promise.all([
            ...fakeAdminAccountsForFakeGroup1.map(fakeAccount => deleteAdminGroup(client, fakeAccount.username, fakeGroup1Id)),
            ...fakeAdminAccountsForFakeGroup2.map(fakeAccount => deleteAdminGroup(client, fakeAccount.username, fakeGroup2Id)),
        ]);
    }
});

describe(addAdmins, () =>
{
    const fakeAdminAccounts: Account[] = [];
    beforeAll(async () =>
    {
        generateFakeAdminAccounts();
        await insertAllFakeAdminAccounts();
        fakeGroupId = await insertFakeGroupAndReturnId(client, fakeGroup);
    });

    afterAll(async () =>
    {
        await deleteAllAdminGroups();
        await deleteFakeGroupById(client, fakeGroupId);
        fakeGroupId = -1;
        await deleteAllFakeAccounts();
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

    async function insertAllFakeAdminAccounts()
    {
        await Promise.all(fakeAdminAccounts.map(fakeAccount => insertFakeAccount(client, fakeAccount)));
    }

    async function deleteAllFakeAccounts()
    {
        await Promise.all(fakeAdminAccounts.map(fakeAccount => deleteFakeAccount(client, fakeAccount.username)));
    }

    async function deleteAllAdminGroups()
    {
        await Promise.all(fakeAdminAccounts.map(fakeAccount => deleteAdminGroup(client, fakeAccount.username, fakeGroupId)));
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
        await insertFakeAccount(client, fakeAccount);
        generateFakeRepositories();
        await insertAllFakeRepositories();
        await insertFakeGroups();
        await insertRepositoryGroups();
    });

    afterAll(async () =>
    {
        await deleteAccountGroups();
        await deleteFakeGroups();
        await deleteAllFakeRepositories();
        await deleteFakeAccount(client, fakeAccount.username);
    });

    it('should get repositories by id', async function ()
    {
        const fakeRepositoriesForFakeGroup1InDatabase = await getRepositoriesById(fakeGroup1Id);
        expect(fakeRepositoriesForFakeGroup1InDatabase.length).toBe(fakeRepositoriesForFakeGroup1.length);
        expect(fakeRepositoriesForFakeGroup1InDatabase)
            .toEqual(expect.arrayContaining(fakeRepositoriesForFakeGroup1));
        const fakeRepositoriesForFakeGroup2InDatabase = await getRepositoriesById(fakeGroup2Id);
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

    async function insertAllFakeRepositories()
    {
        await Promise.all([
            ...fakeRepositoriesForFakeGroup1.map(fakeRepository => insertFakeRepository(client, fakeRepository)),
            ...fakeRepositoriesForFakeGroup2.map(fakeRepository => insertFakeRepository(client, fakeRepository)),
        ]);
    }

    async function insertFakeGroups()
    {
        [fakeGroup1Id, fakeGroup2Id] = await Promise.all([
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
            insertFakeGroupAndReturnId(client, new Group(-1, faker.random.word())),
        ]);
    }

    async function insertRepositoryGroups()
    {
        await Promise.all([
            ...fakeRepositoriesForFakeGroup1.map(fakeRepository => insertRepositoryGroup(client, fakeRepository.username, fakeRepository.name, fakeGroup1Id)),
            ...fakeRepositoriesForFakeGroup2.map(fakeRepository => insertRepositoryGroup(client, fakeRepository.username, fakeRepository.name, fakeGroup2Id)),
        ]);
    }

    async function deleteAllFakeRepositories()
    {
        await Promise.all([
            ...fakeRepositoriesForFakeGroup1.map(fakeRepository => deleteFakeRepository(client, fakeRepository)),
            ...fakeRepositoriesForFakeGroup2.map(fakeRepository => deleteFakeRepository(client, fakeRepository)),
        ]);
    }

    async function deleteFakeGroups()
    {
        await Promise.all([
            deleteFakeGroupById(client, fakeGroup1Id),
            deleteFakeGroupById(client, fakeGroup2Id),
        ]);
    }

    async function deleteAccountGroups()
    {
        await Promise.all([
            ...fakeRepositoriesForFakeGroup1.map(fakeRepository => deleteRepositoryGroup(client, fakeRepository.username, fakeRepository.name, fakeGroup1Id)),
            ...fakeRepositoriesForFakeGroup2.map(fakeRepository => deleteRepositoryGroup(client, fakeRepository.username, fakeRepository.name, fakeGroup2Id)),
        ]);
    }
});

describe(addRepositories, () =>
{
    const fakeRepositories: Repository[] = [];
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    beforeAll(async () =>
    {
        await insertFakeAccount(client, fakeAccount);
        generateFakeRepositories();
        await insertAllFakeRepositories();
        fakeGroupId = await insertFakeGroupAndReturnId(client, fakeGroup);
    });

    afterAll(async () =>
    {
        await deleteAllRepositoryGroups();
        await deleteFakeGroupById(client, fakeGroupId);
        fakeGroupId = -1;
        await deleteAllFakeRepositories();
        await deleteFakeAccount(client, fakeAccount.username);
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

    async function insertAllFakeRepositories()
    {
        await Promise.all(
            fakeRepositories.map(fakeRepository => insertFakeRepository(client, fakeRepository)));
    }

    async function deleteAllFakeRepositories()
    {
        await Promise.all(
            fakeRepositories.map(fakeRepository => deleteFakeRepository(client, fakeRepository)));
    }

    async function deleteAllRepositoryGroups()
    {
        await Promise.all(
            fakeRepositories.map(fakeRepository =>
                deleteRepositoryGroup(client, fakeRepository.username, fakeRepository.name, fakeGroupId)));
    }
});