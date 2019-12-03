import {
    addToGroups,
    deleteByUsernameAndName,
    getGroupByUsernameAndNameAndGroupId,
    getGroupsByUsernameAndName,
    insert,
    removeFromGroups,
    select,
    selectByUsernameAndName,
    update,
} from '../Repository';
import {Account, Group, Repository} from '../../../Class';
import faker from 'faker';
import * as AccountTable from '../Account';
import * as GroupTable from '../Group';
import {deleteById} from '../Group';
import pool from '../../Pool';
import {executeTransaction} from '../../Function';

const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

beforeAll(async () =>
{
    await AccountTable.insert(fakeAccount);
});

afterAll(async () =>
{
    await AccountTable.deleteByUsername(fakeAccount.username);
});

describe(`${insert.name}`, () =>
{
    const fakeRepository = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());

    afterEach(async () =>
    {
        await deleteByUsernameAndName(fakeRepository);
    });

    it('should insert repository', async function ()
    {
        await insert(fakeRepository);
        expect(await selectByUsernameAndName(fakeRepository)).toStrictEqual(fakeRepository);
    });

    it('should throw error when insert the same repository', async function ()
    {
        await insert(fakeRepository);
        await expect(insert(fakeRepository)).rejects.toThrow();
    });
});

describe(`${deleteByUsernameAndName.name}`, () =>
{
    const fakeRepository = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());

    beforeEach(async () =>
    {
        await insert(fakeRepository);
    });

    afterEach(async () =>
    {
        const client = await pool.connect();
        try
        {
            await executeTransaction(client, async client =>
            {
                await client.query(`DELETE
                                    FROM repositories
                                    WHERE username = $1
                                      AND name = $2`,
                    [fakeRepository.username, fakeRepository.name]);
            });
        }
        finally
        {
            client.release();
        }
    });

    it('should delete repository', async function ()
    {
        await deleteByUsernameAndName(fakeRepository);
        expect(await selectByUsernameAndName(fakeRepository)).toBeNull();
    });
});

describe(`${update.name}`, () =>
{
    const fakeRepository = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());

    beforeEach(async () =>
    {
        await insert(fakeRepository);
    });

    afterEach(async () =>
    {
        await deleteByUsernameAndName(fakeRepository);
    });

    it('should update repository not on primary key', async function ()
    {
        const modifiedFakeRepository = Repository.from(fakeRepository);
        modifiedFakeRepository.description = faker.lorem.sentence();
        await update(modifiedFakeRepository, modifiedFakeRepository);
        expect(await selectByUsernameAndName(modifiedFakeRepository)).toStrictEqual(modifiedFakeRepository);
        await deleteByUsernameAndName(modifiedFakeRepository);
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
        expect(await selectByUsernameAndName(modifiedFakeRepository)).toStrictEqual(modifiedFakeRepository);
        await deleteByUsernameAndName(modifiedFakeRepository);
    });
});

describe(`${selectByUsernameAndName.name}`, () =>
{
    const fakeRepository = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());

    beforeAll(async () =>
    {
        await insert(fakeRepository);
    });

    afterAll(async () =>
    {
        await deleteByUsernameAndName(fakeRepository);
    });

    it('should select repository', async function ()
    {
        const repository = await selectByUsernameAndName(fakeRepository);
        expect(repository).toStrictEqual(fakeRepository);
    });

    it('should return null when repository does not exist', async function ()
    {
        const nonexistentRepository = Repository.from(fakeRepository);
        nonexistentRepository.username = faker.name.firstName();
        nonexistentRepository.name = faker.random.word();
        const repository = await selectByUsernameAndName(nonexistentRepository);
        expect(repository).toBeNull();
    });
});

describe(`${select.name}`, () =>
{
    const fakePublicRepositories: Repository[] = [
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), true),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), true),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), true),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), true),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), true),
    ];
    const fakePrivateRepositories: Repository[] = [
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), false),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), false),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), false),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), false),
        new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), false),
    ];

    beforeAll(async () =>
    {
        await Promise.all([...fakePublicRepositories, ...fakePrivateRepositories]
            .map(repository => insert(repository)));
    });

    afterAll(async () =>
    {
        await Promise.all([...fakePublicRepositories, ...fakePrivateRepositories]
            .map(({username, name}) => deleteByUsernameAndName({username, name})));
    });

    it('should select public repository', async function ()
    {
        const repositories = await select({isPublic: true, username: fakeAccount.username});
        repositories.forEach(({isPublic}) => expect(isPublic).toBe(true));
    });

    it('should select private repository', async function ()
    {
        const repositories = await select({isPublic: false, username: fakeAccount.username});
        repositories.forEach(({isPublic}) => expect(isPublic).toBe(false));
    });

    it('should select by username', async function ()
    {
        const [publicRepositories, privateRepositories, repositories] =
            await Promise.all([
                select({isPublic: true, username: faker.name.firstName()}),
                select({isPublic: false, username: faker.name.firstName()}),
                select({username: fakeAccount.username}),
            ]);
        expect(publicRepositories.length).toBe(0);
        expect(privateRepositories.length).toBe(0);
        expect(repositories).toEqual(expect.arrayContaining([...fakePublicRepositories, ...fakePrivateRepositories]));
    });

    it('should select with offset and limit', async function ()
    {
        const [repositories1, repositories2] =
            await Promise.all([
                select({isPublic: true, username: fakeAccount.username}, 0, 1),
                select({isPublic: true, username: fakeAccount.username}, 1, 2),
            ]);
        expect(repositories1.length).toBe(1);
        expect(repositories2.length).toBe(2);
        expect(repositories1[0]).not.toEqual(repositories2[0]);
        expect(repositories1[0]).not.toEqual(repositories2[1]);
    });
});

describe(`${getGroupsByUsernameAndName.name}`, () =>
{
    const fakeRepository1 = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());
    const fakeRepository2 = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());
    const fakeGroupsForRepository1: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];
    const fakeGroupsForRepository2: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];

    beforeAll(async () =>
    {
        await Promise.all([
            insert(fakeRepository1),
            insert(fakeRepository2),
            insertFakeGroupsAndSetTheirIds(),
        ]);
        await Promise.all([
            addToGroups(fakeRepository1, fakeGroupsForRepository1.map(({id}) => id)),
            addToGroups(fakeRepository2, fakeGroupsForRepository2.map(({id}) => id)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            removeFromGroups(fakeRepository1, fakeGroupsForRepository1.map(({id}) => id)),
            removeFromGroups(fakeRepository2, fakeGroupsForRepository2.map(({id}) => id)),
        ]);
        await Promise.all([
            deleteByUsernameAndName(fakeRepository1),
            deleteByUsernameAndName(fakeRepository2),
            ...[...fakeGroupsForRepository1, ...fakeGroupsForRepository2]
                .map(({id}) => deleteById(id)),
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

    async function insertFakeGroupsAndSetTheirIds()
    {
        await Promise.all([...fakeGroupsForRepository1, ...fakeGroupsForRepository2].map(async group =>
        {
            group.id = await GroupTable.insertAndReturnId(group);
        }));
    }
});

describe(`${getGroupByUsernameAndNameAndGroupId.name}`, () =>
{
    const fakeRepository1 = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());
    const fakeRepository2 = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());
    const fakeGroupsForRepository1: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];
    const fakeGroupsForRepository2: Group[] = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];

    beforeAll(async () =>
    {
        await Promise.all([
            insert(fakeRepository1),
            insert(fakeRepository2),
            insertFakeGroupsAndSetTheirIds(),
        ]);
        await Promise.all([
            addToGroups(fakeRepository1, fakeGroupsForRepository1.map(({id}) => id)),
            addToGroups(fakeRepository2, fakeGroupsForRepository2.map(({id}) => id)),
        ]);
    });

    afterAll(async () =>
    {
        await Promise.all([
            removeFromGroups(fakeRepository1, fakeGroupsForRepository1.map(({id}) => id)),
            removeFromGroups(fakeRepository2, fakeGroupsForRepository2.map(({id}) => id)),
        ]);
        await Promise.all([
            deleteByUsernameAndName(fakeRepository1),
            deleteByUsernameAndName(fakeRepository2),
            ...[...fakeGroupsForRepository1, ...fakeGroupsForRepository2]
                .map(({id}) => deleteById(id)),
        ]);
    });

    it('should get groups by username、name and id of group', async function ()
    {
        const [fakeGroup1, fakeGroup2] =
            await Promise.all([
                getGroupByUsernameAndNameAndGroupId(fakeRepository1, fakeGroupsForRepository1[0]),
                getGroupByUsernameAndNameAndGroupId(fakeRepository2, fakeGroupsForRepository2[1]),
            ]);
        expect(fakeGroup1).toStrictEqual(fakeGroupsForRepository1[0]);
        expect(fakeGroup2).toStrictEqual(fakeGroupsForRepository2[1]);
    });

    it('should return null when group does not exist', async function ()
    {
        const fakeGroup = await getGroupByUsernameAndNameAndGroupId(fakeRepository1, fakeGroupsForRepository2[1]);
        expect(fakeGroup).toBeNull();
    });

    async function insertFakeGroupsAndSetTheirIds()
    {
        await Promise.all([...fakeGroupsForRepository1, ...fakeGroupsForRepository2].map(async group =>
        {
            group.id = await GroupTable.insertAndReturnId(group);
        }));
    }
});

describe(`${addToGroups.name}`, () =>
{
    const fakeRepository = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());
    const fakeGroups = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];

    async function insertFakeGroupsAndSetTheirIds()
    {
        await Promise.all(fakeGroups.map(async group =>
        {
            group.id = await GroupTable.insertAndReturnId(group);
        }));
    }

    beforeEach(async () =>
    {
        await Promise.all([
            insert(fakeRepository),
            insertFakeGroupsAndSetTheirIds(),
        ]);
    });

    afterEach(async () =>
    {
        await Promise.all([
            deleteByUsernameAndName(fakeRepository),
            ...fakeGroups.map(({id}) => GroupTable.deleteById(id)),
        ]);
    });

    it('should add repository to groups', async function ()
    {
        const {username, name} = fakeRepository;
        await addToGroups({username, name}, fakeGroups.map(({id}) => id));
        expect(await getGroupsByUsernameAndName({username, name}))
            .toEqual(expect.arrayContaining(fakeGroups));
    });

    it('should handle database error', async function ()
    {
        const {username, name} = fakeRepository;
        await expect(addToGroups({username, name}, [...fakeGroups.map(({id}) => id), -1]))
            .rejects.toThrow();
        expect(await getGroupsByUsernameAndName({username, name}))
            .toEqual([]);
    });
});

describe(`${removeFromGroups.name}`, () =>
{
    const fakeRepository = new Repository(fakeAccount.username, faker.random.word(), faker.lorem.sentence(), faker.random.boolean());
    const fakeGroups = [
        new Group(-1, faker.random.word()),
        new Group(-1, faker.random.word()),
    ];

    async function insertFakeGroupsAndSetTheirIds()
    {
        await Promise.all(fakeGroups.map(async group =>
        {
            group.id = await GroupTable.insertAndReturnId(group);
        }));
    }

    beforeEach(async () =>
    {
        await Promise.all([
            insert(fakeRepository),
            insertFakeGroupsAndSetTheirIds(),
        ]);

        const {username, name} = fakeRepository;
        await addToGroups({username, name}, fakeGroups.map(({id}) => id));
    });

    afterEach(async () =>
    {
        await Promise.all([
            deleteByUsernameAndName(fakeRepository),
            ...fakeGroups.map(({id}) => GroupTable.deleteById(id)),
        ]);
    });

    it('should remove repository from groups', async function ()
    {
        const {username, name} = fakeRepository;
        await removeFromGroups({username, name}, fakeGroups.map(({id}) => id));
        expect(await getGroupsByUsernameAndName({username, name})).toEqual([]);
    });

    it('should handle database error', async function ()
    {
        const {username, name} = fakeRepository;
        await expect(removeFromGroups({username, name}, [...fakeGroups.map(({id}) => id), 1.25]))
            .rejects.toThrow();
        expect(await getGroupsByUsernameAndName({username, name})).toEqual(expect.arrayContaining(fakeGroups));
    });
});