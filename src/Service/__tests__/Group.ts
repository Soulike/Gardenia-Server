import {Account as AccountTable, Group as GroupTable, Repository as RepositoryTable} from '../../Database';
import {Group as GroupFunction} from '../../Function';
import {Account, Group, Repository, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';
import {
    accounts,
    add,
    addAccounts,
    addAdmins,
    admins,
    dismiss,
    info,
    removeAccounts,
    removeAdmins,
    removeRepositories,
    repositories,
} from '../Group';

const databaseMock = {
    Account: {
        selectByUsername: jest.fn<ReturnType<typeof AccountTable.selectByUsername>,
            Parameters<typeof AccountTable.selectByUsername>>(),
    },
    Group: {
        insertAndReturnId: jest.fn<ReturnType<typeof GroupTable.insertAndReturnId>,
            Parameters<typeof GroupTable.insertAndReturnId>>(),
        addAccounts: jest.fn<ReturnType<typeof GroupTable.addAccounts>,
            Parameters<typeof GroupTable.addAccounts>>(),
        removeAccounts: jest.fn<ReturnType<typeof GroupTable.removeAccounts>,
            Parameters<typeof GroupTable.removeAccounts>>(),
        addAdmins: jest.fn<ReturnType<typeof GroupTable.addAdmins>,
            Parameters<typeof GroupTable.addAdmins>>(),
        removeAdmins: jest.fn<ReturnType<typeof GroupTable.removeAdmins>,
            Parameters<typeof GroupTable.removeAdmins>>(),
        deleteById: jest.fn<ReturnType<typeof GroupTable.deleteById>,
            Parameters<typeof GroupTable.deleteById>>(),
        selectById: jest.fn<ReturnType<typeof GroupTable.selectById>,
            Parameters<typeof GroupTable.selectById>>(),
        getAccountsById: jest.fn<ReturnType<typeof GroupTable.getAccountsById>,
            Parameters<typeof GroupTable.getAccountsById>>(),
        getAdminsById: jest.fn<ReturnType<typeof GroupTable.getAdminsById>,
            Parameters<typeof GroupTable.getAdminsById>>(),
        getRepositoriesById: jest.fn<ReturnType<typeof GroupTable.getRepositoriesById>,
            Parameters<typeof GroupTable.getRepositoriesById>>(),
        removeRepositories: jest.fn<ReturnType<typeof GroupTable.removeRepositories>,
            Parameters<typeof GroupTable.removeRepositories>>(),
    },
    Repository: {
        selectByUsernameAndName: jest.fn<ReturnType<typeof RepositoryTable.selectByUsernameAndName>,
            Parameters<typeof RepositoryTable.selectByUsernameAndName>>(),
    },
};

const functionMock = {
    Group: {
        groupNameExists: jest.fn<ReturnType<typeof GroupFunction.groupNameExists>,
            Parameters<typeof GroupFunction.groupNameExists>>(),
        isGroupAdmin: jest.fn<ReturnType<typeof GroupFunction.isGroupAdmin>,
            Parameters<typeof GroupFunction.isGroupAdmin>>(),
        groupExists: jest.fn<ReturnType<typeof GroupFunction.groupExists>,
            Parameters<typeof GroupFunction.groupExists>>(),
        isGroupMember: jest.fn<ReturnType<typeof GroupFunction.isGroupMember>,
            Parameters<typeof GroupFunction.isGroupMember>>(),
    },
};

describe(`${add.name}`, () =>
{
    const fakeAccount = new Account(faker.random.word(), faker.random.alphaNumeric(64));
    const fakeGroup = new Group(faker.random.number(), faker.random.word());
    const fakeSession = {username: fakeAccount.username} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Group.insertAndReturnId.mockResolvedValue(fakeGroup.id);
        databaseMock.Group.addAdmins.mockResolvedValue(undefined);
        databaseMock.Group.deleteById.mockResolvedValue(undefined);
    });

    it('should add group and return group id', async function ()
    {
        functionMock.Group.groupNameExists.mockResolvedValue(false);
        databaseMock.Group.addAdmins.mockResolvedValue(undefined);
        const {add} = await import('../Group');
        const {id, ...rest} = fakeGroup;
        expect(await add(rest, fakeSession)).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(true, '', {id})));

        expect(functionMock.Group.groupNameExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupNameExists)
            .toBeCalledWith({username: fakeAccount.username}, {name: fakeGroup.name});

        expect(databaseMock.Group.insertAndReturnId).toBeCalledTimes(1);
        expect(databaseMock.Group.insertAndReturnId)
            .toBeCalledWith(rest);

        expect(databaseMock.Group.addAccounts).toBeCalledTimes(1);
        expect(databaseMock.Group.addAccounts).toBeCalledWith(fakeGroup.id, [fakeAccount.username]);

        expect(databaseMock.Group.addAdmins).toBeCalledTimes(1);
        expect(databaseMock.Group.addAdmins).toBeCalledWith(fakeGroup.id, [fakeAccount.username]);

        expect(databaseMock.Group.deleteById).toBeCalledTimes(0);
    });

    it('should handle duplicate group name', async function ()
    {
        functionMock.Group.groupNameExists.mockResolvedValue(true);
        databaseMock.Group.addAdmins.mockResolvedValue(undefined);
        const {add} = await import('../Group');
        const {id, ...rest} = fakeGroup;
        expect(await add(rest, fakeSession)).toEqual(
            new ServiceResponse(403, {},
                new ResponseBody(false, '小组名已存在')));

        expect(functionMock.Group.groupNameExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupNameExists)
            .toBeCalledWith({username: fakeAccount.username}, {name: fakeGroup.name});

        expect(databaseMock.Group.insertAndReturnId).toBeCalledTimes(0);
        expect(databaseMock.Group.addAccounts).toBeCalledTimes(0);
        expect(databaseMock.Group.addAdmins).toBeCalledTimes(0);
        expect(databaseMock.Group.deleteById).toBeCalledTimes(0);
    });

    it('should handle database error', async function ()
    {
        functionMock.Group.groupNameExists.mockResolvedValue(false);
        databaseMock.Group.addAdmins.mockRejectedValue(new Error());
        const {add} = await import('../Group');
        const {id, ...rest} = fakeGroup;
        await expect(add(rest, fakeSession)).rejects.toThrow();

        expect(functionMock.Group.groupNameExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupNameExists)
            .toBeCalledWith({username: fakeAccount.username}, {name: fakeGroup.name});

        expect(databaseMock.Group.insertAndReturnId).toBeCalledTimes(1);
        expect(databaseMock.Group.insertAndReturnId)
            .toBeCalledWith(rest);

        expect(databaseMock.Group.addAccounts).toBeCalledTimes(1);
        expect(databaseMock.Group.addAccounts).toBeCalledWith(fakeGroup.id, [fakeAccount.username]);

        expect(databaseMock.Group.addAdmins).toBeCalledTimes(1);
        expect(databaseMock.Group.addAdmins).toBeCalledWith(fakeGroup.id, [fakeAccount.username]);

        expect(databaseMock.Group.deleteById).toBeCalledTimes(1);
        expect(databaseMock.Group.deleteById).toBeCalledWith(fakeGroup.id);
    });
});

describe(`${dismiss.name}`, () =>
{
    const fakeAccount = new Account(faker.random.word(), faker.random.alphaNumeric(64));
    const fakeGroup = new Group(faker.random.number(), faker.random.word());
    const fakeSession = {username: fakeAccount.username} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Group.deleteById.mockResolvedValue(undefined);
    });

    it('should dismiss group', async function ()
    {
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        const {dismiss} = await import('../Group');
        expect(await dismiss({id: fakeGroup.id}, fakeSession))
            .toEqual(new ServiceResponse(200, {},
                new ResponseBody(true)));
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);

        expect(databaseMock.Group.deleteById).toBeCalledTimes(1);
        expect(databaseMock.Group.deleteById).toBeCalledWith(fakeGroup.id);
    });

    it('non-admin can not dismiss group', async function ()
    {
        functionMock.Group.isGroupAdmin.mockResolvedValue(false);
        const {dismiss} = await import('../Group');
        expect(await dismiss({id: fakeGroup.id}, fakeSession))
            .toEqual(new ServiceResponse(403, {},
                new ResponseBody(false, '解散失败：您不是小组的管理员')));

        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);

        expect(databaseMock.Group.deleteById).toBeCalledTimes(0);
    });
});

describe(`${info.name}`, () =>
{
    const fakeGroup = new Group(faker.random.number(), faker.random.word());

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
    });

    it('should get group info', async function ()
    {
        databaseMock.Group.selectById.mockResolvedValue(fakeGroup);
        const {info} = await import('../Group');
        expect(await info({id: fakeGroup.id}))
            .toEqual(new ServiceResponse(200, {},
                new ResponseBody(true, '', fakeGroup)));
        expect(databaseMock.Group.selectById).toBeCalledTimes(1);
        expect(databaseMock.Group.selectById).toBeCalledWith(fakeGroup.id);
    });

    it('should handle nonexistent group', async function ()
    {
        databaseMock.Group.selectById.mockResolvedValue(null);
        const {info} = await import('../Group');
        expect(await info({id: fakeGroup.id}))
            .toEqual(new ServiceResponse(404, {},
                new ResponseBody(false, '小组不存在')));
        expect(databaseMock.Group.selectById).toBeCalledTimes(1);
        expect(databaseMock.Group.selectById).toBeCalledWith(fakeGroup.id);
    });
});

describe(`${accounts.name}`, () =>
{
    const fakeAccounts = [
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
    ];
    const fakeGroup = new Group(faker.random.number(), faker.random.word());

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
    });

    it('should get accounts of group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        databaseMock.Group.getAccountsById.mockResolvedValue(fakeAccounts);
        const {accounts} = await import('../Group');
        expect(await accounts({id: fakeGroup.id})).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(true, '', fakeAccounts)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(databaseMock.Group.getAccountsById).toBeCalledTimes(1);
        expect(databaseMock.Group.getAccountsById).toBeCalledWith(fakeGroup.id);
    });

    it('should handle nonexistent group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(false);
        databaseMock.Group.getAccountsById.mockResolvedValue(fakeAccounts);
        const {accounts} = await import('../Group');
        expect(await accounts({id: fakeGroup.id})).toEqual(
            new ServiceResponse(404, {},
                new ResponseBody(false, '小组不存在')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(databaseMock.Group.getAccountsById).toBeCalledTimes(0);
    });
});

describe(`${addAccounts.name}`, () =>
{
    const fakeAccounts = [
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
    ];
    const fakeUsernames = fakeAccounts.map(({username}) => username);
    const fakeGroup = new Group(faker.random.number(), faker.random.word());
    const fakeSession = {username: faker.random.word()} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Group.addAccounts.mockResolvedValue(undefined);
    });

    it('should add accounts to group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[0]);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[1]);
        const {addAccounts} = await import('../Group');
        expect(await addAccounts(
            {id: fakeGroup.id},
            fakeUsernames,
            fakeSession),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Account.selectByUsername).toBeCalledTimes(2);
        expect(databaseMock.Account.selectByUsername).toHaveBeenNthCalledWith(1, fakeUsernames[0]);
        expect(databaseMock.Account.selectByUsername).toHaveBeenNthCalledWith(2, fakeUsernames[1]);
        expect(databaseMock.Group.addAccounts).toBeCalledTimes(1);
        expect(databaseMock.Group.addAccounts).toBeCalledWith(fakeGroup.id, fakeUsernames);
    });

    it('should handle nonexistent group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(false);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[0]);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[1]);
        const {addAccounts} = await import('../Group');
        expect(await addAccounts(
            {id: fakeGroup.id},
            fakeUsernames,
            fakeSession),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '小组不存在')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(0);
        expect(databaseMock.Account.selectByUsername).toBeCalledTimes(0);
        expect(databaseMock.Group.addAccounts).toBeCalledTimes(0);
    });

    it('should handle non-admin request', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(false);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[0]);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[1]);
        const {addAccounts} = await import('../Group');
        expect(await addAccounts(
            {id: fakeGroup.id},
            fakeUsernames,
            fakeSession),
        ).toEqual(new ServiceResponse(403, {},
            new ResponseBody(false, '添加失败：您不是小组的管理员')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Account.selectByUsername).toBeCalledTimes(0);
        expect(databaseMock.Group.addAccounts).toBeCalledTimes(0);
    });

    it('should handle nonexistent account', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[0]);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(null);
        const {addAccounts} = await import('../Group');
        expect(await addAccounts(
            {id: fakeGroup.id},
            fakeUsernames,
            fakeSession),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, `用户${fakeUsernames[1]}不存在`)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Account.selectByUsername).toBeCalledTimes(2);
        expect(databaseMock.Account.selectByUsername).toHaveBeenNthCalledWith(1, fakeUsernames[0]);
        expect(databaseMock.Account.selectByUsername).toHaveBeenNthCalledWith(2, fakeUsernames[1]);
        expect(databaseMock.Group.addAccounts).toBeCalledTimes(0);
    });
});

describe(`${removeAccounts.name}`, () =>
{
    const fakeAccounts = [
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
    ];
    const fakeUsernames = fakeAccounts.map(({username}) => username);
    const fakeGroup = new Group(faker.random.number(), faker.random.word());
    const fakeSession = {username: faker.random.word()} as unknown as Session;
    const fakeSelfSession = {username: fakeUsernames[0]} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Group.removeAccounts.mockResolvedValue(undefined);
    });

    it('should remove accounts', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        const {removeAccounts} = await import('../Group');
        expect(await removeAccounts({id: fakeGroup.id}, fakeUsernames, fakeSession))
            .toEqual(new ServiceResponse(200, {},
                new ResponseBody(true)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Group.removeAccounts).toBeCalledTimes(1);
        expect(databaseMock.Group.removeAccounts).toBeCalledWith(fakeGroup.id, fakeUsernames);
    });

    it('should handle nonexistent group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(false);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        const {removeAccounts} = await import('../Group');
        expect(await removeAccounts({id: fakeGroup.id}, fakeUsernames, fakeSession))
            .toEqual(new ServiceResponse(404, {},
                new ResponseBody(false, '小组不存在')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(0);
        expect(databaseMock.Group.removeAccounts).toBeCalledTimes(0);
    });

    it('should handle non-admin request', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(false);
        const {removeAccounts} = await import('../Group');
        expect(await removeAccounts({id: fakeGroup.id}, fakeUsernames, fakeSession))
            .toEqual(new ServiceResponse(403, {},
                new ResponseBody(false, '删除失败：您不是小组的管理员')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Group.removeAccounts).toBeCalledTimes(0);
    });

    it('should handle remove self request', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        const {removeAccounts} = await import('../Group');
        expect(await removeAccounts({id: fakeGroup.id}, fakeUsernames, fakeSelfSession))
            .toEqual(new ServiceResponse(403, {},
                new ResponseBody(false, '不允许移除自己')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSelfSession);
        expect(databaseMock.Group.removeAccounts).toBeCalledTimes(0);
    });
});

describe(`${admins.name}`, () =>
{
    const fakeAccounts = [
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
    ];
    const fakeGroup = new Group(faker.random.number(), faker.random.word());

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
    });

    it('should get admins of group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        databaseMock.Group.getAdminsById.mockResolvedValue(fakeAccounts);
        const {admins} = await import('../Group');
        expect(await admins({id: fakeGroup.id})).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(true, '', fakeAccounts)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(databaseMock.Group.getAdminsById).toBeCalledTimes(1);
        expect(databaseMock.Group.getAdminsById).toBeCalledWith(fakeGroup.id);
    });

    it('should handle nonexistent group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(false);
        databaseMock.Group.getAdminsById.mockResolvedValue(fakeAccounts);
        const {admins} = await import('../Group');
        expect(await admins({id: fakeGroup.id})).toEqual(
            new ServiceResponse(404, {},
                new ResponseBody(false, '小组不存在')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(databaseMock.Group.getAdminsById).toBeCalledTimes(0);
    });
});

describe(`${addAdmins.name}`, () =>
{
    const fakeAccounts = [
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
    ];
    const fakeUsernames = fakeAccounts.map(({username}) => username);
    const fakeGroup = new Group(faker.random.number(), faker.random.word());
    const fakeSession = {username: faker.random.word()} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Group.addAdmins.mockResolvedValue(undefined);
    });

    it('should add admins to group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[0]);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[1]);
        functionMock.Group.isGroupMember.mockResolvedValue(true);
        const {addAdmins} = await import('../Group');
        expect(await addAdmins(
            {id: fakeGroup.id},
            fakeUsernames,
            fakeSession),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Account.selectByUsername).toBeCalledTimes(2);
        expect(databaseMock.Account.selectByUsername).toHaveBeenNthCalledWith(1, fakeUsernames[0]);
        expect(databaseMock.Account.selectByUsername).toHaveBeenNthCalledWith(2, fakeUsernames[1]);
        expect(functionMock.Group.isGroupMember).toBeCalledTimes(2);
        expect(functionMock.Group.isGroupMember)
            .toHaveBeenNthCalledWith(1, {id: fakeGroup.id}, fakeUsernames[0]);
        expect(functionMock.Group.isGroupMember)
            .toHaveBeenNthCalledWith(2, {id: fakeGroup.id}, fakeUsernames[1]);
        expect(databaseMock.Group.addAdmins).toBeCalledTimes(1);
        expect(databaseMock.Group.addAdmins).toBeCalledWith(fakeGroup.id, fakeUsernames);
    });

    it('should handle nonexistent group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(false);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[0]);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[1]);
        functionMock.Group.isGroupMember.mockResolvedValue(true);
        const {addAdmins} = await import('../Group');
        expect(await addAdmins(
            {id: fakeGroup.id},
            fakeUsernames,
            fakeSession),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '小组不存在')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(0);
        expect(databaseMock.Account.selectByUsername).toBeCalledTimes(0);
        expect(functionMock.Group.isGroupMember).toBeCalledTimes(0);
        expect(databaseMock.Group.addAdmins).toBeCalledTimes(0);
    });

    it('should handle non-admin request', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(false);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[0]);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[1]);
        functionMock.Group.isGroupMember.mockResolvedValue(true);
        const {addAdmins} = await import('../Group');
        expect(await addAdmins(
            {id: fakeGroup.id},
            fakeUsernames,
            fakeSession),
        ).toEqual(new ServiceResponse(403, {},
            new ResponseBody(false, '添加失败：您不是小组的管理员')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Account.selectByUsername).toBeCalledTimes(0);
        expect(functionMock.Group.isGroupMember).toBeCalledTimes(0);
        expect(databaseMock.Group.addAdmins).toBeCalledTimes(0);
    });

    it('should handle nonexistent account', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[0]);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(null);
        functionMock.Group.isGroupMember.mockResolvedValue(true);
        const {addAdmins} = await import('../Group');
        expect(await addAdmins(
            {id: fakeGroup.id},
            fakeUsernames,
            fakeSession),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, `用户${fakeUsernames[1]}不存在`)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Account.selectByUsername).toBeCalledTimes(2);
        expect(databaseMock.Account.selectByUsername).toHaveBeenNthCalledWith(1, fakeUsernames[0]);
        expect(databaseMock.Account.selectByUsername).toHaveBeenNthCalledWith(2, fakeUsernames[1]);
        expect(functionMock.Group.isGroupMember).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupMember)
            .toHaveBeenNthCalledWith(1, {id: fakeGroup.id}, fakeUsernames[0]);
        expect(databaseMock.Group.addAdmins).toBeCalledTimes(0);
    });

    it('should handle non-member adding request', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[0]);
        databaseMock.Account.selectByUsername.mockResolvedValueOnce(fakeAccounts[1]);
        functionMock.Group.isGroupMember.mockResolvedValueOnce(true);
        functionMock.Group.isGroupMember.mockResolvedValueOnce(false);
        const {addAdmins} = await import('../Group');
        expect(await addAdmins(
            {id: fakeGroup.id},
            fakeUsernames,
            fakeSession),
        ).toEqual(new ServiceResponse(403, {},
            new ResponseBody(false, `用户${fakeUsernames[1]}不是小组成员`)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Account.selectByUsername).toBeCalledTimes(2);
        expect(databaseMock.Account.selectByUsername).toHaveBeenNthCalledWith(1, fakeUsernames[0]);
        expect(databaseMock.Account.selectByUsername).toHaveBeenNthCalledWith(2, fakeUsernames[1]);
        expect(functionMock.Group.isGroupMember).toBeCalledTimes(2);
        expect(functionMock.Group.isGroupMember)
            .toHaveBeenNthCalledWith(1, {id: fakeGroup.id}, fakeUsernames[0]);
        expect(functionMock.Group.isGroupMember)
            .toHaveBeenNthCalledWith(2, {id: fakeGroup.id}, fakeUsernames[1]);
        expect(databaseMock.Group.addAdmins).toBeCalledTimes(0);
    });
});

describe(`${removeAdmins.name}`, () =>
{
    const fakeAccounts = [
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
        new Account(faker.random.word(), faker.random.alphaNumeric(64)),
    ];
    const fakeUsernames = fakeAccounts.map(({username}) => username);
    const fakeGroup = new Group(faker.random.number(), faker.random.word());
    const fakeSession = {username: faker.random.word()} as unknown as Session;
    const fakeSelfSession = {username: fakeUsernames[0]} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Group.removeAdmins.mockResolvedValue(undefined);
    });

    it('should remove admins', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        const {removeAdmins} = await import('../Group');
        expect(await removeAdmins({id: fakeGroup.id}, fakeUsernames, fakeSession))
            .toEqual(new ServiceResponse(200, {},
                new ResponseBody(true)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Group.removeAdmins).toBeCalledTimes(1);
        expect(databaseMock.Group.removeAdmins).toBeCalledWith(fakeGroup.id, fakeUsernames);
    });

    it('should handle nonexistent group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(false);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        const {removeAdmins} = await import('../Group');
        expect(await removeAdmins({id: fakeGroup.id}, fakeUsernames, fakeSession))
            .toEqual(new ServiceResponse(404, {},
                new ResponseBody(false, '小组不存在')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(0);
        expect(databaseMock.Group.removeAdmins).toBeCalledTimes(0);
    });

    it('should handle non-admin request', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(false);
        const {removeAdmins} = await import('../Group');
        expect(await removeAdmins({id: fakeGroup.id}, fakeUsernames, fakeSession))
            .toEqual(new ServiceResponse(403, {},
                new ResponseBody(false, '删除失败：您不是小组的管理员')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Group.removeAdmins).toBeCalledTimes(0);
    });

    it('should handle remove self request', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        const {removeAdmins} = await import('../Group');
        expect(await removeAdmins({id: fakeGroup.id}, fakeUsernames, fakeSelfSession))
            .toEqual(new ServiceResponse(403, {},
                new ResponseBody(false, '不允许移除自己')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSelfSession);
        expect(databaseMock.Group.removeAdmins).toBeCalledTimes(0);
    });
});

describe(`${repositories.name}`, () =>
{
    const fakeGroup = new Group(faker.random.number(), faker.random.word());
    const fakeRepositories = [
        new Repository(faker.random.word(), faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
        new Repository(faker.random.word(), faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
    ];

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
    });

    it('should get repositories of group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        databaseMock.Group.getRepositoriesById.mockResolvedValue(fakeRepositories);
        const {repositories} = await import('../Group');
        expect(await repositories({id: fakeGroup.id})).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(true, '', fakeRepositories)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(databaseMock.Group.getRepositoriesById).toBeCalledTimes(1);
        expect(databaseMock.Group.getRepositoriesById).toBeCalledWith(fakeGroup.id);
    });

    it('should handle nonexistent group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(false);
        databaseMock.Group.getRepositoriesById.mockResolvedValue(fakeRepositories);
        const {repositories} = await import('../Group');
        expect(await repositories({id: fakeGroup.id})).toEqual(
            new ServiceResponse(404, {},
                new ResponseBody(false, '小组不存在')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(databaseMock.Group.getRepositoriesById).toBeCalledTimes(0);
    });
});

describe(`${removeRepositories.name}`, () =>
{
    const fakeAccount = new Account(faker.random.word(), faker.random.alphaNumeric(64));
    const fakeGroup = new Group(faker.random.number(), faker.random.word());
    const fakeRepositories = [
        new Repository(faker.random.word(), faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
        new Repository(faker.random.word(), faker.random.word(), faker.lorem.sentence(), faker.random.boolean()),
    ];
    const fakeSession = {username: fakeAccount.username} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Group.removeRepositories.mockResolvedValue(undefined);
    });

    it('should remove repositories of group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeRepositories[0]);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeRepositories[1]);
        const {removeRepositories} = await import('../Group');
        expect(await removeRepositories(
            {id: fakeGroup.id},
            fakeRepositories.map(({username, name}) => ({username, name})),
            fakeSession)).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(2);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(1,
                {username: fakeRepositories[0].username, name: fakeRepositories[0].name});
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(2,
                {username: fakeRepositories[1].username, name: fakeRepositories[1].name});
        expect(databaseMock.Group.removeRepositories).toBeCalledTimes(1);
        expect(databaseMock.Group.removeRepositories)
            .toBeCalledWith(fakeGroup.id,
                fakeRepositories.map(({username, name}) => ({username, name})));
    });

    it('should handle nonexistent group', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(false);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeRepositories[0]);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeRepositories[1]);
        const {removeRepositories} = await import('../Group');
        expect(await removeRepositories(
            {id: fakeGroup.id},
            fakeRepositories.map(({username, name}) => ({username, name})),
            fakeSession)).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '小组不存在')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(0);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(0);
        expect(databaseMock.Group.removeRepositories).toBeCalledTimes(0);
    });

    it('should handle non-admin request', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(false);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeRepositories[0]);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeRepositories[1]);
        const {removeRepositories} = await import('../Group');
        expect(await removeRepositories(
            {id: fakeGroup.id},
            fakeRepositories.map(({username, name}) => ({username, name})),
            fakeSession)).toEqual(new ServiceResponse(403, {},
            new ResponseBody(false, '删除失败：您不是小组的管理员')));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(0);
        expect(databaseMock.Group.removeRepositories).toBeCalledTimes(0);
    });

    it('should handle non-existent repository', async function ()
    {
        functionMock.Group.groupExists.mockResolvedValue(true);
        functionMock.Group.isGroupAdmin.mockResolvedValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeRepositories[0]);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(null);
        const {removeRepositories} = await import('../Group');
        expect(await removeRepositories(
            {id: fakeGroup.id},
            fakeRepositories.map(({username, name}) => ({username, name})),
            fakeSession)).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, `仓库${fakeRepositories[1].name}不存在`)));
        expect(functionMock.Group.groupExists).toBeCalledTimes(1);
        expect(functionMock.Group.groupExists).toBeCalledWith({id: fakeGroup.id});
        expect(functionMock.Group.isGroupAdmin).toBeCalledTimes(1);
        expect(functionMock.Group.isGroupAdmin).toBeCalledWith({id: fakeGroup.id}, fakeSession);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(2);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(1,
                {username: fakeRepositories[0].username, name: fakeRepositories[0].name});
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(2,
                {username: fakeRepositories[1].username, name: fakeRepositories[1].name});
        expect(databaseMock.Group.removeRepositories).toBeCalledTimes(0);
    });
});