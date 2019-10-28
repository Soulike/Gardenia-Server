import {
    deleteByUsernameAndName,
    getGroupsByUsernameAndName,
    insert,
    selectByIsPublic,
    selectByIsPublicAndUsername,
    selectByUsername,
    selectByUsernameAndName,
    update,
} from '../Repository';
import {Account, Group, Repository} from '../../../Class';
import faker from 'faker';
import {PoolClient} from 'pg';
import pool from '../../Pool';
import {
    deleteFakeAccount,
    deleteFakeGroupsByIds,
    deleteFakeRepositories,
    deleteFakeRepository,
    deleteRepositoryGroups,
    insertFakeAccount,
    insertFakeGroupAndReturnId,
    insertFakeRepositories,
    insertFakeRepository,
    insertRepositoryGroups,
    selectFakeRepository,
} from '../_TestHelper';

const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
const fakeRepository = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());
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

describe(insert, () =>
{
    afterEach(async () =>
    {
        await deleteFakeRepository(client, fakeRepository);
    });

    it('should insert repository', async function ()
    {
        await insert(fakeRepository);
        expect(await selectFakeRepository(client, fakeRepository)).toStrictEqual(fakeRepository);
    });

    it('should throw error when insert the same repository', async function ()
    {
        await insertFakeRepository(client, fakeRepository);
        await expect(insert(fakeRepository)).rejects.toThrow();
    });
});

describe(deleteByUsernameAndName, () =>
{
    beforeEach(async () =>
    {
        await insertFakeRepository(client, fakeRepository);
    });

    afterEach(async () =>
    {
        await deleteFakeRepository(client, fakeRepository);
    });

    it('should delete repository', async function ()
    {
        await deleteByUsernameAndName(fakeRepository.username, fakeRepository.name);
        expect(await selectFakeRepository(client, fakeRepository)).toBeNull();
    });
});

describe(update, () =>
{
    beforeEach(async () =>
    {
        await insertFakeRepository(client, fakeRepository);
    });

    afterEach(async () =>
    {
        await deleteFakeRepository(client, fakeRepository);
    });

    it('should update repository not on primary key', async function ()
    {
        const modifiedFakeRepository = Repository.from(fakeRepository);
        modifiedFakeRepository.description = faker.lorem.sentence();
        await update(modifiedFakeRepository);
        expect(await selectFakeRepository(client, modifiedFakeRepository)).toStrictEqual(modifiedFakeRepository);
        await deleteFakeRepository(client, modifiedFakeRepository);
    });

    it('should update repository on primary key', async function ()
    {
        const modifiedFakeRepository = Repository.from(fakeRepository);
        modifiedFakeRepository.name = faker.lorem.word();
        modifiedFakeRepository.description = faker.lorem.sentence();
        await update(modifiedFakeRepository, {
            username: fakeRepository.username,
            name: fakeRepository.name,
        });
        expect(await selectFakeRepository(client, modifiedFakeRepository)).toStrictEqual(modifiedFakeRepository);
        await deleteFakeRepository(client, modifiedFakeRepository);
    });
});

describe(selectByUsernameAndName, () =>
{
    beforeAll(async () =>
    {
        await insertFakeRepository(client, fakeRepository);
    });

    afterAll(async () =>
    {
        await deleteFakeRepository(client, fakeRepository);
    });

    it('should select repository', async function ()
    {
        const repository = await selectByUsernameAndName(fakeRepository.username, fakeRepository.name);
        expect(repository).toStrictEqual(fakeRepository);
    });

    it('should return null when repository does not exist', async function ()
    {
        const nonexistentRepository = Repository.from(fakeRepository);
        nonexistentRepository.username = faker.name.firstName();
        nonexistentRepository.name = faker.random.word();
        const repository = await selectByUsernameAndName(nonexistentRepository.username, nonexistentRepository.name);
        expect(repository).toBeNull();
    });
});

describe(selectByIsPublic, () =>
{
    const fakePublicRepositories: Repository[] = [];
    const fakePrivateRepositories: Repository[] = [];

    beforeAll(async () =>
    {
        generateRepositories();
        await Promise.all([
            insertFakeRepositories(client, fakePublicRepositories),
            insertFakeRepositories(client, fakePrivateRepositories),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteFakeRepositories(client, fakePublicRepositories),
            deleteFakeRepositories(client, fakePrivateRepositories),
        ]);
    });

    it('should select public repository', async function ()
    {
        const repositories = await selectByIsPublic(true);
        repositories.forEach(({isPublic}) => expect(isPublic).toBe(true));
    });

    it('should select private repository', async function ()
    {
        const repositories = await selectByIsPublic(false);
        repositories.forEach(({isPublic}) => expect(isPublic).toBe(false));
    });

    it('should select with offset and limit', async function ()
    {
        const [repositories1, repositories2] = await Promise.all([
            selectByIsPublic(true, 0, 1),
            selectByIsPublic(true, 1, 2),
        ]);
        expect(repositories1.length).toBe(1);
        expect(repositories2.length).toBe(2);
        expect(repositories1[0]).not.toEqual(repositories2[0]);
        expect(repositories1[0]).not.toEqual(repositories2[1]);
    });

    function generateRepositories()
    {
        for (let i = 0; i < 5; i++)
        {
            fakePublicRepositories.push(new Repository(fakeAccount.username, i.toString(), faker.lorem.sentence(), true));
            fakePrivateRepositories.push(new Repository(fakeAccount.username, (Number.MAX_SAFE_INTEGER - i).toString(), faker.lorem.sentence(), false));
        }
    }
});

describe(selectByIsPublicAndUsername, () =>
{
    const fakePublicRepositories: Repository[] = [];
    const fakePrivateRepositories: Repository[] = [];

    beforeAll(async () =>
    {
        generateRepositories();
        await Promise.all([
            insertFakeRepositories(client, fakePublicRepositories),
            insertFakeRepositories(client, fakePrivateRepositories),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteFakeRepositories(client, fakePublicRepositories),
            deleteFakeRepositories(client, fakePrivateRepositories),
        ]);
    });

    it('should select public repository', async function ()
    {
        const repositories = await selectByIsPublicAndUsername(true, fakeAccount.username);
        repositories.forEach(({isPublic}) => expect(isPublic).toBe(true));
    });

    it('should select private repository', async function ()
    {
        const repositories = await selectByIsPublicAndUsername(false, fakeAccount.username);
        repositories.forEach(({isPublic}) => expect(isPublic).toBe(false));
    });

    it('should select by username', async function ()
    {
        const [publicRepositories, privateRepositories] =
            await Promise.all([
                selectByIsPublicAndUsername(true, faker.name.firstName()),
                selectByIsPublicAndUsername(false, faker.name.firstName()),
            ]);
        expect(publicRepositories.length).toBe(0);
        expect(privateRepositories.length).toBe(0);
    });

    it('should select with offset and limit', async function ()
    {
        const [repositories1, repositories2] =
            await Promise.all([
                selectByIsPublicAndUsername(true, fakeAccount.username, 0, 1),
                selectByIsPublicAndUsername(true, fakeAccount.username, 1, 2),
            ]);
        expect(repositories1.length).toBe(1);
        expect(repositories2.length).toBe(2);
        expect(repositories1[0]).not.toEqual(repositories2[0]);
        expect(repositories1[0]).not.toEqual(repositories2[1]);
    });

    function generateRepositories()
    {
        for (let i = 0; i < 5; i++)
        {
            fakePublicRepositories.push(new Repository(fakeAccount.username, i.toString(), faker.lorem.sentence(), true));
            fakePrivateRepositories.push(new Repository(fakeAccount.username, (Number.MAX_SAFE_INTEGER - i).toString(), faker.lorem.sentence(), false));
        }
    }
});

describe(selectByUsername, () =>
{
    const fakeRepositories: Repository[] = [];

    beforeAll(async () =>
    {
        generateRepositories();
        await insertFakeRepositories(client, fakeRepositories);
    });

    afterAll(async () =>
    {
        await deleteFakeRepositories(client, fakeRepositories);
    });

    it('should select repositories by username', async function ()
    {
        const [repositories, repositoriesOfOther] =
            await Promise.all([
                selectByUsername(fakeAccount.username),
                selectByUsername(faker.name.firstName()),
            ]);
        expect(repositories.length).toBe(fakeRepositories.length);
        repositories.forEach(repository => expect(fakeRepositories).toContainEqual(repository));
        expect(repositoriesOfOther.length).toBe(0);
    });

    it('should select with offset and limit', async function ()
    {
        const [repositories1, repositories2] =
            await Promise.all([
                selectByUsername(fakeAccount.username, 0, 1),
                selectByUsername(fakeAccount.username, 1, 2),
            ]);
        expect(repositories1.length).toBe(1);
        expect(repositories2.length).toBe(2);
        expect(repositories1[0]).not.toEqual(repositories2[0]);
        expect(repositories1[0]).not.toEqual(repositories2[1]);
    });

    function generateRepositories()
    {
        for (let i = 0; i < 5; i++)
        {
            fakeRepositories.push(new Repository(fakeAccount.username, i.toString(), faker.lorem.sentence(), faker.random.boolean()));
        }
    }
});

describe(getGroupsByUsernameAndName, () =>
{
    const fakeRepository1 = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());
    const fakeRepository2 = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());
    const fakeGroupsForRepository1: Group[] = [];
    const fakeGroupsForRepository2: Group[] = [];

    beforeAll(async () =>
    {
        generateFakeGroups();
        await Promise.all([
            insertFakeRepositories(client, [fakeRepository1, fakeRepository2]),
            insertFakeGroups(),
        ]);
        await Promise.all([
            insertRepositoryGroups(client, fakeRepository1, fakeGroupsForRepository1.map(({id}) => id)),
            insertRepositoryGroups(client, fakeRepository2, fakeGroupsForRepository2.map(({id}) => id)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            deleteRepositoryGroups(client, fakeRepository1, fakeGroupsForRepository1.map(({id}) => id)),
            deleteRepositoryGroups(client, fakeRepository2, fakeGroupsForRepository2.map(({id}) => id)),
        ]);
        await Promise.all([
            deleteFakeRepositories(client, [fakeRepository1, fakeRepository2]),
            deleteFakeGroupsByIds(client, fakeGroupsForRepository1.map(({id}) => id)),
            deleteFakeGroupsByIds(client, fakeGroupsForRepository2.map(({id}) => id)),
        ]);
    });

    it('should get groups', async function ()
    {
        const [fakeGroupsForRepository1InDatabase, fakeGroupsForRepository2InDatabase] =
            await Promise.all([
                getGroupsByUsernameAndName(fakeRepository1),
                getGroupsByUsernameAndName(fakeRepository2),
            ]);
        expect(fakeGroupsForRepository1InDatabase.length).toBe(fakeGroupsForRepository1.length);
        expect(fakeGroupsForRepository1InDatabase).toEqual(expect.arrayContaining(fakeGroupsForRepository1));
        expect(fakeGroupsForRepository2InDatabase.length).toBe(fakeGroupsForRepository2.length);
        expect(fakeGroupsForRepository2InDatabase).toEqual(expect.arrayContaining(fakeGroupsForRepository2));
    });

    function generateFakeGroups()
    {
        for (let i = 0; i < 10; i++)
        {
            fakeGroupsForRepository1.push(new Group(-1, faker.random.word()));
            fakeGroupsForRepository2.push(new Group(-1, faker.random.word()));
        }
    }

    async function insertFakeGroups()
    {
        await Promise.all([
            ...fakeGroupsForRepository1.map(async group =>
            {
                group.id = await insertFakeGroupAndReturnId(client, group);
            }),
            ...fakeGroupsForRepository2.map(async group =>
            {
                group.id = await insertFakeGroupAndReturnId(client, group);
            }),
        ]);
    }
});