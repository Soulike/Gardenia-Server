import {
    del,
    insert,
    select,
    selectByIsPublic,
    selectByIsPublicAndUsername,
    selectByUsername,
    update,
} from '../Repository';
import {deleteFakeAccount, insertFakeAccount} from './Account';
import {Account, Repository} from '../../../Class';
import faker from 'faker';
import {Client, PoolClient} from 'pg';
import pool from '../../Pool';

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

describe(del, () =>
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
        await del(fakeRepository.username, fakeRepository.name);
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

describe(select, () =>
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
        const repository = await select(fakeRepository.username, fakeRepository.name);
        expect(repository).toStrictEqual(fakeRepository);
    });

    it('should return null when repository does not exist', async function ()
    {
        const nonexistentRepository = Repository.from(fakeRepository);
        nonexistentRepository.username = faker.name.firstName();
        nonexistentRepository.name = faker.random.word();
        const repository = await select(nonexistentRepository.username, nonexistentRepository.name);
        expect(repository).toBeNull();
    });
});

describe(selectByIsPublic, () =>
{
    const fakePublicRepositories: Repository[] = [];
    const fakePrivateRepositories: Repository[] = [];

    beforeAll(async () =>
    {
        for (let i = 0; i < 5; i++)
        {
            fakePublicRepositories.push(new Repository(fakeAccount.username, i.toString(), faker.lorem.sentence(), true));
            fakePrivateRepositories.push(new Repository(fakeAccount.username, (Number.MAX_SAFE_INTEGER - i).toString(), faker.lorem.sentence(), false));
        }
        await Promise.all([
            ...fakePublicRepositories.map(repository => insertFakeRepository(client, repository)),
            ...fakePrivateRepositories.map(repository => insertFakeRepository(client, repository)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            ...fakePublicRepositories.map(repository => deleteFakeRepository(client, repository)),
            ...fakePrivateRepositories.map(repository => deleteFakeRepository(client, repository)),
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
        const repositories1 = await selectByIsPublic(true, 0, 1);
        const repositories2 = await selectByIsPublic(true, 1, 2);
        expect(repositories1.length).toBe(1);
        expect(repositories2.length).toBe(2);
        expect(repositories1[0]).not.toEqual(repositories2[0]);
        expect(repositories1[0]).not.toEqual(repositories2[1]);
    });
});

describe(selectByIsPublicAndUsername, () =>
{
    const fakePublicRepositories: Repository[] = [];
    const fakePrivateRepositories: Repository[] = [];

    beforeAll(async () =>
    {
        for (let i = 0; i < 5; i++)
        {
            fakePublicRepositories.push(new Repository(fakeAccount.username, i.toString(), faker.lorem.sentence(), true));
            fakePrivateRepositories.push(new Repository(fakeAccount.username, (Number.MAX_SAFE_INTEGER - i).toString(), faker.lorem.sentence(), false));
        }
        await Promise.all([
            ...fakePublicRepositories.map(repository => insertFakeRepository(client, repository)),
            ...fakePrivateRepositories.map(repository => insertFakeRepository(client, repository)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            ...fakePublicRepositories.map(repository => deleteFakeRepository(client, repository)),
            ...fakePrivateRepositories.map(repository => deleteFakeRepository(client, repository)),
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
        const publicRepositories = await selectByIsPublicAndUsername(true, faker.name.firstName());
        expect(publicRepositories.length).toBe(0);

        const privateRepositories = await selectByIsPublicAndUsername(false, faker.name.firstName());
        expect(privateRepositories.length).toBe(0);
    });

    it('should select with offset and limit', async function ()
    {
        const repositories1 = await selectByIsPublicAndUsername(true, fakeAccount.username, 0, 1);
        const repositories2 = await selectByIsPublicAndUsername(true, fakeAccount.username, 1, 2);
        expect(repositories1.length).toBe(1);
        expect(repositories2.length).toBe(2);
        expect(repositories1[0]).not.toEqual(repositories2[0]);
        expect(repositories1[0]).not.toEqual(repositories2[1]);
    });
});

describe(selectByUsername, () =>
{
    const fakeRepositories: Repository[] = [];

    beforeAll(async () =>
    {
        for (let i = 0; i < 5; i++)
        {
            fakeRepositories.push(new Repository(fakeAccount.username, i.toString(), faker.lorem.sentence(), faker.random.boolean()));
        }
        await Promise.all(fakeRepositories.map(repository => insertFakeRepository(client, repository)));
    });

    afterAll(async () =>
    {
        await Promise.all(fakeRepositories.map(repository => deleteFakeRepository(client, repository)));
    });

    it('should select repositories by username', async function ()
    {
        const repositories = await selectByUsername(fakeAccount.username);
        expect(repositories.length).toBe(fakeRepositories.length);
        repositories.forEach(repository => expect(fakeRepositories).toContainEqual(repository));

        const repositoriesOfOther = await selectByUsername(faker.name.firstName());
        expect(repositoriesOfOther.length).toBe(0);
    });

    it('should select with offset and limit', async function ()
    {
        const repositories1 = await selectByUsername(fakeAccount.username, 0, 1);
        const repositories2 = await selectByUsername(fakeAccount.username, 1, 2);
        expect(repositories1.length).toBe(1);
        expect(repositories2.length).toBe(2);
        expect(repositories1[0]).not.toEqual(repositories2[0]);
        expect(repositories1[0]).not.toEqual(repositories2[1]);
    });
});

export async function selectFakeRepository(client: Client | PoolClient, repository: Repository): Promise<Repository | null>
{
    const {rowCount, rows} = await client.query(
        'SELECT * FROM repositories WHERE username=$1 AND name=$2',
        [repository.username, repository.name]);
    if (rowCount !== 1)
    {
        return null;
    }
    else
    {
        return Repository.from(rows[0]);
    }
}

export async function insertFakeRepository(client: Client | PoolClient, repository: Repository)
{
    await client.query('START TRANSACTION');
    await client.query(
        'INSERT INTO repositories (username, name, description, "isPublic") VALUES ($1,$2,$3,$4)',
        [repository.username, repository.name, repository.description, repository.isPublic]);
    await client.query('COMMIT');
}

export async function deleteFakeRepository(client: Client | PoolClient, repository: Repository)
{
    await client.query('START TRANSACTION');
    await client.query(
        'DELETE FROM repositories WHERE username=$1 AND name=$2',
        [repository.username, repository.name]);
    await client.query('COMMIT');
}