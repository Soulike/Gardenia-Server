import {Account as AccountTable, Group as GroupTable} from '../../Database';
import {Account, Group} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';
import {groupExists, isGroupAdmin, isGroupMember} from '../Group';

const databaseMock = {
    Account: {
        getGroupByUsernameAndGroupName: jest.fn<ReturnType<typeof AccountTable.getGroupByUsernameAndGroupName>,
            Parameters<typeof AccountTable.getGroupByUsernameAndGroupName>>(),
    },
    Group: {
        getAccountsById: jest.fn<ReturnType<typeof GroupTable.getAccountsById>,
            Parameters<typeof GroupTable.getAccountsById>>(),
        getAdminsById: jest.fn<ReturnType<typeof GroupTable.getAdminsById>,
            Parameters<typeof GroupTable.getAdminsById>>(),
        selectById: jest.fn<ReturnType<typeof GroupTable.selectById>,
            Parameters<typeof GroupTable.selectById>>(),
    },
};


describe(`${isGroupAdmin.name}`, () =>
{
    const fakeAccount = new Account(faker.random.word(), faker.random.alphaNumeric(64));
    const fakeGroup = new Group(faker.random.number(), faker.random.word());
    const fakeSession = {username: fakeAccount.username} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.resetModules();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should return true when is admin', async function ()
    {
        databaseMock.Group.getAdminsById.mockResolvedValue([fakeAccount]);  // includes fakeAccount
        const {isGroupAdmin} = await import('../Group');
        expect(await isGroupAdmin({id: fakeGroup.id}, fakeSession)).toBe(true);

        expect(databaseMock.Group.getAdminsById).toBeCalledTimes(1);
        expect(databaseMock.Group.getAdminsById).toBeCalledWith(fakeGroup.id);
    });

    it('should return false when is not admin', async function ()
    {
        databaseMock.Group.getAdminsById.mockResolvedValue([]); // does not include fakeAccount
        const {isGroupAdmin} = await import('../Group');
        expect(await isGroupAdmin({id: fakeGroup.id}, fakeSession)).toBe(false);

        expect(databaseMock.Group.getAdminsById).toBeCalledTimes(1);
        expect(databaseMock.Group.getAdminsById).toBeCalledWith(fakeGroup.id);
    });
});

describe(`${isGroupMember.name}`, () =>
{
    const fakeAccount = new Account(faker.random.word(), faker.random.alphaNumeric(64));
    const fakeGroup = new Group(faker.random.number(), faker.random.word());

    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.resetModules();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should return true when is a group member', async function ()
    {
        databaseMock.Group.getAccountsById.mockResolvedValue([fakeAccount]);  // includes fakeAccount
        const {isGroupMember} = await import('../Group');
        expect(await isGroupMember({id: fakeGroup.id}, fakeAccount.username)).toBe(true);

        expect(databaseMock.Group.getAccountsById).toBeCalledTimes(1);
        expect(databaseMock.Group.getAccountsById).toBeCalledWith(fakeGroup.id);
    });

    it('should return false when is not a group member', async function ()
    {
        databaseMock.Group.getAccountsById.mockResolvedValue([]);  // does not include fakeAccount
        const {isGroupMember} = await import('../Group');
        expect(await isGroupMember({id: fakeGroup.id}, fakeAccount.username)).toBe(false);

        expect(databaseMock.Group.getAccountsById).toBeCalledTimes(1);
        expect(databaseMock.Group.getAccountsById).toBeCalledWith(fakeGroup.id);
    });
});

describe(`${groupExists.name}`, () =>
{
    const fakeGroup = new Group(faker.random.number(), faker.random.word());

    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.resetModules();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should return true when group exists', async function ()
    {
        databaseMock.Group.selectById.mockResolvedValue(fakeGroup);
        const {groupExists} = await import('../Group');
        expect(await groupExists({id: fakeGroup.id})).toBe(true);
        expect(databaseMock.Group.selectById).toBeCalledTimes(1);
        expect(databaseMock.Group.selectById).toBeCalledWith(fakeGroup.id);
    });

    it('should return false when group does not exist', async function ()
    {
        databaseMock.Group.selectById.mockResolvedValue(null);
        const {groupExists} = await import('../Group');
        expect(await groupExists({id: fakeGroup.id})).toBe(false);
        expect(databaseMock.Group.selectById).toBeCalledTimes(1);
        expect(databaseMock.Group.selectById).toBeCalledWith(fakeGroup.id);
    });
});

describe(`groupNameExists`, () =>
{
    const fakeAccount = new Account(faker.random.word(), faker.random.alphaNumeric(64));
    const fakeGroup = new Group(faker.random.number(), faker.random.word());

    beforeEach(() =>
    {
        jest.resetAllMocks();
        jest.resetModules();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should return true when group name exists', async function ()
    {
        databaseMock.Account.getGroupByUsernameAndGroupName.mockResolvedValue(fakeGroup);
        const {groupNameExists} = await import('../Group');
        expect(await groupNameExists({username: fakeAccount.username}, {name: fakeGroup.name}))
            .toBe(true);
        expect(databaseMock.Account.getGroupByUsernameAndGroupName).toBeCalledTimes(1);
        expect(databaseMock.Account.getGroupByUsernameAndGroupName)
            .toBeCalledWith(fakeAccount.username, fakeGroup.name);
    });

    it('should return true when group name does not exist', async function ()
    {
        databaseMock.Account.getGroupByUsernameAndGroupName.mockResolvedValue(null);
        const {groupNameExists} = await import('../Group');
        expect(await groupNameExists({username: fakeAccount.username}, {name: fakeGroup.name}))
            .toBe(false);
        expect(databaseMock.Account.getGroupByUsernameAndGroupName).toBeCalledTimes(1);
        expect(databaseMock.Account.getGroupByUsernameAndGroupName)
            .toBeCalledWith(fakeAccount.username, fakeGroup.name);
    });
});