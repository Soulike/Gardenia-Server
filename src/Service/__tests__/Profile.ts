import {get} from '../Profile';
import {Profile as ProfileClass, Profile, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';

const fakeProfile = new Profile(faker.random.word(), faker.name.firstName(), faker.internet.email(), '');

describe(get, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should get profile by session', async function ()
    {
        const mockObject = {
            Profile: {
                selectByUsername: jest.fn().mockResolvedValue(fakeProfile),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {get} = await import('../Profile');
        const response = await get({username: fakeProfile.username} as unknown as Session);
        expect(response).toEqual(new ServiceResponse<ProfileClass>(200, {},
            new ResponseBody<ProfileClass>(true, '', fakeProfile)));
        expect(mockObject.Profile.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Profile.selectByUsername.mock.calls[0][0]).toBe(fakeProfile.username);
    });

    it('should get profile by account', async function ()
    {
        const mockObject = {
            Profile: {
                selectByUsername: jest.fn().mockResolvedValue(fakeProfile),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {get} = await import('../Profile');
        const response = await get({} as unknown as Session, {username: fakeProfile.username});
        expect(response).toEqual(new ServiceResponse<ProfileClass>(200, {},
            new ResponseBody<ProfileClass>(true, '', fakeProfile)));
        expect(mockObject.Profile.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Profile.selectByUsername.mock.calls[0][0]).toBe(fakeProfile.username);
    });

    it('should get profile by account first', async function ()
    {
        const mockObject = {
            Profile: {
                selectByUsername: jest.fn().mockResolvedValue(fakeProfile),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {get} = await import('../Profile');
        const response = await get(
            {username: faker.random.word()} as unknown as Session,
            {username: fakeProfile.username});
        expect(response).toEqual(new ServiceResponse<ProfileClass>(200, {},
            new ResponseBody<ProfileClass>(true, '', fakeProfile)));
        expect(mockObject.Profile.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Profile.selectByUsername.mock.calls[0][0]).toBe(fakeProfile.username);
    });

    it('should check account existence by session', async function ()
    {
        const mockObject = {
            Profile: {
                selectByUsername: jest.fn().mockResolvedValue(null),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {get} = await import('../Profile');
        const response = await get(
            {username: fakeProfile.username} as unknown as Session);
        expect(response).toEqual(new ServiceResponse<ProfileClass>(404, {},
            new ResponseBody<ProfileClass>(false, '用户不存在')));
        expect(mockObject.Profile.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Profile.selectByUsername.mock.calls[0][0]).toBe(fakeProfile.username);
    });

    it('should check account existence by account', async function ()
    {
        const mockObject = {
            Profile: {
                selectByUsername: jest.fn().mockResolvedValue(null),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {get} = await import('../Profile');
        const response = await get(
            {} as unknown as Session,
            {username: fakeProfile.username});
        expect(response).toEqual(new ServiceResponse<ProfileClass>(404, {},
            new ResponseBody<ProfileClass>(false, '用户不存在')));
        expect(mockObject.Profile.selectByUsername.mock.calls.length).toBe(1);
        expect(mockObject.Profile.selectByUsername.mock.calls[0][0]).toBe(fakeProfile.username);
    });
});