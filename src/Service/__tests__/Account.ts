import {Account, Group, Profile, ResponseBody, ServiceResponse} from '../../Class';
import {checkPassword, checkSession, getAdministratingGroups, getGroups, login, logout, register} from '../Account';
import {Session} from 'koa-session';
import {Account as AccountTable} from '../../Database';
import {Session as SessionFunction} from '../../Function';

const fakeAccount = new Account('barsrharsh', 'A'.repeat(64));

const databaseMock = {
    Account: {
        selectByUsername: jest.fn<ReturnType<typeof AccountTable.selectByUsername>,
            Parameters<typeof AccountTable.selectByUsername>>(),
        create: jest.fn<ReturnType<typeof AccountTable.create>,
            Parameters<typeof AccountTable.create>>(),
        getGroupsByUsername: jest.fn<ReturnType<typeof AccountTable.getGroupsByUsername>,
            Parameters<typeof AccountTable.getGroupsByUsername>>(),
        getAdministratingGroupsByUsername: jest.fn<ReturnType<typeof AccountTable.getAdministratingGroupsByUsername>,
            Parameters<typeof AccountTable.getAdministratingGroupsByUsername>>(),
    },
};

const functionMock = {
    Session: {
        isSessionValid: jest.fn<ReturnType<typeof SessionFunction.isSessionValid>,
            Parameters<typeof SessionFunction.isSessionValid>>(),
    },
};

describe(`${login.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should check account existence', async function ()
    {
        databaseMock.Account.selectByUsername.mockResolvedValue(null);
        const {login} = await import('../Account');
        const response = await login(fakeAccount);
        expect(response).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名或密码错误')));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
    });

    it('should login and set session', async function ()
    {
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeAccount);
        const {login} = await import('../Account');
        const response = await login(fakeAccount);
        expect(response).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true), {username: fakeAccount.username}));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
    });

    it('should check password', async function ()
    {
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeAccount);
        const {login} = await import('../Account');
        const response = await login({...fakeAccount, hash: 'b'.repeat(64)});
        expect(response).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名或密码错误')));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
    });
});

describe(`${register.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should check account existence', async function ()
    {
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeAccount);
        databaseMock.Account.create.mockResolvedValue(undefined);
        const {register} = await import('../Account');
        const response = await register(fakeAccount,
            new Profile(fakeAccount.username, 'ghwrhwh', 'a@b.com', ''));
        expect(response).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名已存在')));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
        expect(databaseMock.Account.create.mock.calls.length).toBe(0);
    });

    it('should create account and profile', async function ()
    {
        databaseMock.Account.selectByUsername.mockResolvedValue(null);
        databaseMock.Account.create.mockResolvedValue(undefined);
        const fakeProfile = new Profile(fakeAccount.username, 'gfaefaehwrhwh', 'a@b.com', '');
        const {register} = await import('../Account');
        const response = await register(fakeAccount,
            {
                nickname: fakeProfile.nickname,
                avatar: fakeProfile.avatar,
                email: fakeProfile.email,
            });
        expect(response).toEqual(new ServiceResponse<void>(200, {}, new ResponseBody<void>(true)));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
        expect(databaseMock.Account.create.mock.calls.pop()).toEqual([fakeAccount, fakeProfile]);
    });
});

describe(`${checkSession.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../Function', () => functionMock);
    });

    it('should check session', async function ()
    {
        const fakeSession = {username: 'faegaeg'} as unknown as Session;
        functionMock.Session.isSessionValid.mockReturnValue(true);
        const {checkSession} = await import('../Account');
        const response = await checkSession(fakeSession);
        expect(response).toEqual(new ServiceResponse<{ isValid: boolean }>(200, {},
            new ResponseBody(true, '', {isValid: true})));
        expect(functionMock.Session.isSessionValid).toBeCalledTimes(1);
        expect(functionMock.Session.isSessionValid).toBeCalledWith(fakeSession);
    });
});

describe(`${logout.name}`, () =>
{
    it('should invalidate session', async function ()
    {
        const result = await logout();
        expect(result).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true), {username: undefined}));
    });
});

describe(`${getGroups.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should check account existence', async function ()
    {
        databaseMock.Account.selectByUsername.mockResolvedValue(null);
        databaseMock.Account.getGroupsByUsername.mockResolvedValue([]);
        const {getGroups} = await import('../Account');
        const result = await getGroups(fakeAccount);
        expect(result).toEqual(new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, '用户不存在')));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
        expect(databaseMock.Account.getGroupsByUsername.mock.calls.length).toBe(0);
    });

    it('should get groups', async function ()
    {
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeAccount);
        databaseMock.Account.getGroupsByUsername.mockResolvedValue([]);
        const {getGroups} = await import('../Account');
        const result = await getGroups(fakeAccount);
        expect(result).toEqual(new ServiceResponse<Group[]>(200, {},
            new ResponseBody<Group[]>(true, '', [])));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
        expect(databaseMock.Account.getGroupsByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
    });
});

describe(`${getAdministratingGroups.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should check account existence', async function ()
    {
        databaseMock.Account.selectByUsername.mockResolvedValue(null);
        databaseMock.Account.getAdministratingGroupsByUsername.mockResolvedValue([]);
        const {getAdministratingGroups} = await import('../Account');
        const result = await getAdministratingGroups(fakeAccount);
        expect(result).toEqual(new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, '用户不存在')));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
        expect(databaseMock.Account.getAdministratingGroupsByUsername.mock.calls.length).toBe(0);
    });

    it('should get administrating groups', async function ()
    {
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeAccount);
        databaseMock.Account.getAdministratingGroupsByUsername.mockResolvedValue([]);
        const {getAdministratingGroups} = await import('../Account');
        const result = await getAdministratingGroups(fakeAccount);
        expect(result).toEqual(new ServiceResponse<Group[]>(200, {},
            new ResponseBody<Group[]>(true, '', [])));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
        expect(databaseMock.Account.getAdministratingGroupsByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
    });
});

describe(`${checkPassword.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should work when account does not exist', async function ()
    {
        const fakeSession = {username: fakeAccount.username} as unknown as Session;
        databaseMock.Account.selectByUsername.mockResolvedValue(null);
        const {checkPassword} = await import('../Account');
        const result = await checkPassword(
            {hash: fakeAccount.hash},
            fakeSession);
        expect(result).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', {isCorrect: false})));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
    });

    it('should work when password is correct', async function ()
    {
        const fakeSession = {username: fakeAccount.username} as unknown as Session;
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeAccount);
        const {checkPassword} = await import('../Account');
        const result = await checkPassword(
            {hash: fakeAccount.hash},
            fakeSession);
        expect(result).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', {isCorrect: true})));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
    });

    it('should work when password is wrong', async function ()
    {
        const fakeSession = {username: fakeAccount.username} as unknown as Session;
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeAccount);
        const {checkPassword} = await import('../Account');
        const result = await checkPassword(
            {hash: 'c'.repeat(64)},
            fakeSession);
        expect(result).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', {isCorrect: false})));
        expect(databaseMock.Account.selectByUsername.mock.calls.pop()).toEqual([fakeAccount.username]);
    });
});