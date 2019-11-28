import {Group as GroupTable} from '../../Database';
import {Group as GroupFunction} from '../../Function';
import {Account, Group, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';
import {add, dismiss} from '../Group';

const databaseMock = {
    Group: {
        insertAndReturnId: jest.fn<ReturnType<typeof GroupTable.insertAndReturnId>,
            Parameters<typeof GroupTable.insertAndReturnId>>(),
        addAccounts: jest.fn<ReturnType<typeof GroupTable.addAccounts>,
            Parameters<typeof GroupTable.addAccounts>>(),
        addAdmins: jest.fn<ReturnType<typeof GroupTable.addAdmins>,
            Parameters<typeof GroupTable.addAdmins>>(),
        deleteById: jest.fn<ReturnType<typeof GroupTable.deleteById>,
            Parameters<typeof GroupTable.deleteById>>(),
    },
};

const functionMock = {
    Group: {
        groupNameExists: jest.fn<ReturnType<typeof GroupFunction.groupNameExists>,
            Parameters<typeof GroupFunction.groupNameExists>>(),
        isGroupAdmin: jest.fn<ReturnType<typeof GroupFunction.isGroupAdmin>,
            Parameters<typeof GroupFunction.isGroupAdmin>>(),
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