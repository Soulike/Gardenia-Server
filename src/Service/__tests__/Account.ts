import {Account, Group, Profile, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {checkPassword, checkSession, getAdministratingGroups, getGroups, login, logout, register} from '../Account';
import {Session} from 'koa-session';
import {InvalidSessionError} from '../../Dispatcher/Class';

const fakeAccount = new Account(faker.random.word(), faker.random.alphaNumeric(64));

describe(login, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should check account existence', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(null),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {login} = await import('../Account');
        const response = await login(fakeAccount);
        expect(response).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名或密码错误')));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toBe(fakeAccount.username);
    });

    it('should login and set session', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(fakeAccount),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {login} = await import('../Account');
        const response = await login(fakeAccount);
        expect(response).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true), {username: fakeAccount.username}));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toBe(fakeAccount.username);
    });

    it('should check password', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(fakeAccount),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {login} = await import('../Account');
        const response = await login({...fakeAccount, hash: faker.random.alphaNumeric(64)});
        expect(response).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名或密码错误')));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toBe(fakeAccount.username);
    });
});

describe(register, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should check account existence', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(fakeAccount),
                create: jest.fn().mockResolvedValue(undefined),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {register} = await import('../Account');
        const response = await register(fakeAccount,
            new Profile('', faker.name.firstName(), faker.internet.email(), ''));
        expect(response).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名已存在')));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toBe(fakeAccount.username);
        expect(mockObject.Account.create.mock.calls.length).toBe(0);
    });

    it('should create account and profile', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(null),
                create: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fakeProfile = new Profile(fakeAccount.username, faker.random.word(), faker.internet.email(), '');
        jest.mock('../../Database', () => mockObject);
        const {register} = await import('../Account');
        const response = await register(fakeAccount,
            {
                nickname: fakeProfile.nickname,
                avatar: fakeProfile.avatar,
                email: fakeProfile.email,
            });
        expect(response).toEqual(new ServiceResponse<void>(200, {}, new ResponseBody<void>(true)));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toBe(fakeAccount.username);
        expect(mockObject.Account.create.mock.calls.length).toBe(1);
        expect(mockObject.Account.create.mock.calls[0][0]).toEqual(fakeAccount);
        expect(mockObject.Account.create.mock.calls[0][1]).toEqual(fakeProfile);
    });
});

describe(checkSession, () =>
{
    it('should check valid session', async function ()
    {
        const response = await checkSession({username: fakeAccount.username} as unknown as Session);
        expect(response).toEqual(new ServiceResponse<{ isValid: boolean }>(200, {},
            new ResponseBody(true, '', {isValid: true})));
    });

    it('should check invalid session', async function ()
    {
        let response = await checkSession({} as unknown as Session);
        expect(response).toEqual(new ServiceResponse<{ isValid: boolean }>(200, {},
            new ResponseBody(true, '', {isValid: false})));

        response = await checkSession({username: 111} as unknown as Session);
        expect(response).toEqual(new ServiceResponse<{ isValid: boolean }>(200, {},
            new ResponseBody(true, '', {isValid: false})));

        response = await checkSession({username: undefined} as unknown as Session);
        expect(response).toEqual(new ServiceResponse<{ isValid: boolean }>(200, {},
            new ResponseBody(true, '', {isValid: false})));
    });
});

describe(logout, () =>
{
    it('should invalidate session', async function ()
    {
        const result = await logout();
        expect(result).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true), {username: undefined}));
    });
});

describe(getGroups, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should check account existence', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(null),
                getGroupsByUsername: jest.fn().mockResolvedValue([]),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {getGroups} = await import('../Account');
        const result = await getGroups(fakeAccount);
        expect(result).toEqual(new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, '用户不存在')));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toBe(fakeAccount.username);
        expect(mockObject.Account.getGroupsByUsername.mock.calls.length).toBe(0);
    });

    it('should get groups', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(fakeAccount),
                getGroupsByUsername: jest.fn().mockResolvedValue([]),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {getGroups} = await import('../Account');
        const result = await getGroups(fakeAccount);
        expect(result).toEqual(new ServiceResponse<Group[]>(200, {},
            new ResponseBody<Group[]>(true, '', [])));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toBe(fakeAccount.username);
        expect(mockObject.Account.getGroupsByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.getGroupsByUsername.mock.calls[0][0]).toEqual(fakeAccount.username);
    });
});

describe(getAdministratingGroups, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should check account existence', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(null),
                getAdministratingGroupsByUsername: jest.fn().mockResolvedValue([]),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {getAdministratingGroups} = await import('../Account');
        const result = await getAdministratingGroups(fakeAccount);
        expect(result).toEqual(new ServiceResponse<Group[]>(404, {},
            new ResponseBody<Group[]>(false, '用户不存在')));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toBe(fakeAccount.username);
        expect(mockObject.Account.getAdministratingGroupsByUsername.mock.calls.length).toBe(0);
    });

    it('should get administrating groups', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(fakeAccount),
                getAdministratingGroupsByUsername: jest.fn().mockResolvedValue([]),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {getAdministratingGroups} = await import('../Account');
        const result = await getAdministratingGroups(fakeAccount);
        expect(result).toEqual(new ServiceResponse<Group[]>(200, {},
            new ResponseBody<Group[]>(true, '', [])));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toBe(fakeAccount.username);
        expect(mockObject.Account.getAdministratingGroupsByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.getAdministratingGroupsByUsername.mock.calls[0][0]).toEqual(fakeAccount.username);
    });
});

describe(checkPassword, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should throw error when session is invalid', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(null),
            },
        };
        await expect(checkPassword(fakeAccount, {} as unknown as Session)).rejects.toBeInstanceOf(InvalidSessionError);
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(0);
    });

    it('should work when account does not exist', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(null),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {checkPassword} = await import('../Account');
        const result = await checkPassword(
            {hash: fakeAccount.hash},
            {username: fakeAccount.username} as unknown as Session);
        expect(result).toEqual(new ServiceResponse<{ isCorrect: boolean }>(200, {},
            new ResponseBody<{ isCorrect: boolean }>(true, '', {isCorrect: false})));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toEqual(fakeAccount.username);
    });

    it('should work when password is correct', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(fakeAccount),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {checkPassword} = await import('../Account');
        const result = await checkPassword(
            {hash: fakeAccount.hash},
            {username: fakeAccount.username} as unknown as Session);
        expect(result).toEqual(new ServiceResponse<{ isCorrect: boolean }>(200, {},
            new ResponseBody<{ isCorrect: boolean }>(true, '', {isCorrect: true})));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toEqual(fakeAccount.username);
    });

    it('should work when password is wrong', async function ()
    {
        const mockObject = {
            Account: {
                selectByUsername: jest.fn().mockResolvedValue(fakeAccount),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {checkPassword} = await import('../Account');
        const result = await checkPassword(
            {hash: faker.random.alphaNumeric(64)},
            {username: fakeAccount.username} as unknown as Session);
        expect(result).toEqual(new ServiceResponse<{ isCorrect: boolean }>(200, {},
            new ResponseBody<{ isCorrect: boolean }>(true, '', {isCorrect: false})));
        expect(mockObject.Account.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Account.selectByUsername.mock.calls[0][0]).toEqual(fakeAccount.username);
    });
});