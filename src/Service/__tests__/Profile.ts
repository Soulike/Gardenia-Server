import {get, set, updateAvatar} from '../Profile';
import {Account, Profile as ProfileClass, Profile, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';
import {InvalidSessionError} from '../../Dispatcher/Class';
import {File} from 'formidable';
import path from 'path';
import os from 'os';
import imageminWebp from 'imagemin-webp';
import {SERVER} from '../../CONFIG';
import {Profile as ProfileTable} from '../../Database';

const fakeProfile = new Profile(faker.random.word(), faker.name.firstName(), faker.internet.email(), '');

const databaseMock = {
    Profile: {
        selectByUsername: jest.fn<ReturnType<typeof ProfileTable.selectByUsername>,
            Parameters<typeof ProfileTable.selectByUsername>>(),
        update: jest.fn<ReturnType<typeof ProfileTable.update>,
            Parameters<typeof ProfileTable.update>>().mockResolvedValue(undefined),
    },
};

const fseMock = {
    move: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
};
const imageminMock = jest.fn().mockResolvedValue(undefined);

describe(get, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should check session', async function ()
    {
        databaseMock.Profile.selectByUsername.mockResolvedValue(fakeProfile);
        const {get} = await import('../Profile');
        await expect(get({} as unknown as Session)).rejects.toEqual(new InvalidSessionError());
        expect(databaseMock.Profile.selectByUsername.mock.calls.length).toBe(0);
    });

    it('should get profile by session', async function ()
    {
        databaseMock.Profile.selectByUsername.mockResolvedValue(fakeProfile);
        const {get} = await import('../Profile');
        const response = await get({username: fakeProfile.username} as unknown as Session);
        expect(response).toEqual(new ServiceResponse<ProfileClass>(200, {},
            new ResponseBody<ProfileClass>(true, '', fakeProfile)));
        expect(databaseMock.Profile.selectByUsername.mock.calls.pop()).toEqual([fakeProfile.username]);
    });

    it('should get profile by account', async function ()
    {
        databaseMock.Profile.selectByUsername.mockResolvedValue(fakeProfile);
        const {get} = await import('../Profile');
        const response = await get({} as unknown as Session, {username: fakeProfile.username});
        expect(response).toEqual(new ServiceResponse<ProfileClass>(200, {},
            new ResponseBody<ProfileClass>(true, '', fakeProfile)));
        expect(databaseMock.Profile.selectByUsername.mock.calls.pop()).toEqual([fakeProfile.username]);
    });

    it('should get profile by account first', async function ()
    {
        databaseMock.Profile.selectByUsername.mockResolvedValue(fakeProfile);
        const {get} = await import('../Profile');
        const response = await get(
            {username: faker.random.word()} as unknown as Session,
            {username: fakeProfile.username});
        expect(response).toEqual(new ServiceResponse<ProfileClass>(200, {},
            new ResponseBody<ProfileClass>(true, '', fakeProfile)));
        expect(databaseMock.Profile.selectByUsername.mock.calls.pop()).toEqual([fakeProfile.username]);
    });

    it('should check account existence by account', async function ()
    {
        databaseMock.Profile.selectByUsername.mockResolvedValue(null);
        const {get} = await import('../Profile');
        const response = await get(
            {} as unknown as Session,
            {username: fakeProfile.username});
        expect(response).toEqual(new ServiceResponse<ProfileClass>(404, {},
            new ResponseBody<ProfileClass>(false, '用户不存在')));
        expect(databaseMock.Profile.selectByUsername.mock.calls.pop()).toEqual([fakeProfile.username]);
    });
});

describe(set, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
    });

    it('should check session', async function ()
    {
        await expect(set({}, {} as unknown as Session)).rejects.toBeInstanceOf(InvalidSessionError);
        expect(databaseMock.Profile.update.mock.calls.length).toBe(0);
    });

    it('should set profile', async function ()
    {
        const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
        const fakeProfile: Partial<Omit<Profile, 'avatar' | 'username'>> = {
            email: faker.internet.email(),
            nickname: faker.name.firstName(),
        };
        const {set} = await import('../Profile');
        expect(
            await set(fakeProfile, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));
        expect(databaseMock.Profile.update.mock.calls.pop()).toEqual([
            fakeProfile,
            {username: fakeAccount.username},
        ]);
    });
});

describe(updateAvatar, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('imagemin', () => imageminMock);
    });

    it('should check session', async function ()
    {
        const fakeFile: File = {
            size: 0,
            path: '',
            name: faker.random.word(),
            type: '',
            lastModifiedDate: faker.date.past(),
            hash: faker.random.alphaNumeric(64),
            toJSON: () => ({}),
        };
        await expect(updateAvatar(fakeFile, {} as unknown as Session)).rejects.toBeInstanceOf(InvalidSessionError);
        expect(databaseMock.Profile.update.mock.calls.length).toBe(0);
    });

    it('should modify avatar', async function ()
    {
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeFile: File = {
            size: 0,
            path: path.join(faker.random.word(), faker.random.word(), faker.random.word()),
            name: faker.random.word(),
            type: '',
            lastModifiedDate: faker.date.past(),
            hash: faker.random.alphaNumeric(64),
            toJSON: () => ({}),
        };
        const avatarPath = path.join(SERVER.STATIC_FILE_PATH, 'avatar', `${fakeAccount.username}.webp`);
        const tempAvatarPath = path.join(os.tmpdir(), `${fakeAccount.username}.webp`);

        const {updateAvatar} = await import('../Profile');
        expect(
            await updateAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));
        expect(databaseMock.Profile.update.mock.calls.pop()).toEqual([
            {avatar: `/avatar/${fakeAccount.username}.webp`}, {username: fakeAccount.username},
        ]);

        expect(JSON.stringify(imageminMock.mock.calls.pop())).toBe(JSON.stringify(
            [
                [fakeFile.path],
                {
                    destination: tempAvatarPath,
                    plugins: [
                        imageminWebp({
                            quality: 100,
                            method: 6,
                            resize: {
                                width: 250,
                                height: 250,
                            },
                        }),
                    ],
                },
            ],
        ));

        expect(fseMock.move.mock.calls.pop()).toEqual([tempAvatarPath, avatarPath, {overwrite: true}]);

        expect(fseMock.remove.mock.calls.length).toBe(2);
        expect(fseMock.remove.mock.calls).toEqual(expect.arrayContaining(
            [
                [fakeFile.path],
                [tempAvatarPath],
            ]));
    });

    it('should process imagemin error', async function ()
    {
        imageminMock.mockRejectedValue(new Error());
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeFile: File = {
            size: 0,
            path: path.join(faker.random.word(), faker.random.word(), faker.random.word()),
            name: faker.random.word(),
            type: '',
            lastModifiedDate: faker.date.past(),
            hash: faker.random.alphaNumeric(64),
            toJSON: () => ({}),
        };
        const tempAvatarPath = path.join(os.tmpdir(), `${fakeAccount.username}.webp`);

        const {updateAvatar} = await import('../Profile');
        await expect(
            updateAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).rejects.toThrow();

        expect(databaseMock.Profile.update.mock.calls.length).toBe(0);

        expect(JSON.stringify(imageminMock.mock.calls.pop())).toBe(JSON.stringify(
            [
                [fakeFile.path],
                {
                    destination: tempAvatarPath,
                    plugins: [
                        imageminWebp({
                            quality: 100,
                            method: 6,
                            resize: {
                                width: 250,
                                height: 250,
                            },
                        }),
                    ],
                },
            ],
        ));

        expect(fseMock.move.mock.calls.length).toBe(0);

        expect([
            fseMock.remove.mock.calls.pop(),
            fseMock.remove.mock.calls.pop()],
        ).toEqual(expect.arrayContaining(
            [
                [fakeFile.path],
                [tempAvatarPath],
            ]));
    });

    it('should process database error', async function ()
    {
        databaseMock.Profile.update.mockRejectedValue(new Error());
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeFile: File = {
            size: 0,
            path: path.join(faker.random.word(), faker.random.word(), faker.random.word()),
            name: faker.random.word(),
            type: '',
            lastModifiedDate: faker.date.past(),
            hash: faker.random.alphaNumeric(64),
            toJSON: () => ({}),
        };
        const tempAvatarPath = path.join(os.tmpdir(), `${fakeAccount.username}.webp`);

        const {updateAvatar} = await import('../Profile');
        await expect(
            updateAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).rejects.toThrow();

        expect(databaseMock.Profile.update.mock.calls.pop()).toEqual([
            {avatar: `/avatar/${fakeAccount.username}.webp`}, {username: fakeAccount.username},
        ]);

        expect(JSON.stringify(imageminMock.mock.calls.pop())).toEqual(
            JSON.stringify([
                [fakeFile.path],
                {
                    destination: tempAvatarPath,
                    plugins: [
                        imageminWebp({
                            quality: 100,
                            method: 6,
                            resize: {
                                width: 250,
                                height: 250,
                            },
                        }),
                    ],
                },
            ]),
        );

        expect(fseMock.move.mock.calls.length).toBe(0);

        expect(fseMock.remove.mock.calls.length).toBe(2);
        expect(fseMock.remove.mock.calls).toEqual(expect.arrayContaining(
            [
                [fakeFile.path],
                [tempAvatarPath],
            ]));
    });

    it('should process fse move error', async function ()
    {
        fseMock.move.mockRejectedValue(new Error());
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeFile: File = {
            size: 0,
            path: path.join(faker.random.word(), faker.random.word(), faker.random.word()),
            name: faker.random.word(),
            type: '',
            lastModifiedDate: faker.date.past(),
            hash: faker.random.alphaNumeric(64),
            toJSON: () => ({}),
        };
        const avatarPath = path.join(SERVER.STATIC_FILE_PATH, 'avatar', `${fakeAccount.username}.webp`);
        const tempAvatarPath = path.join(os.tmpdir(), `${fakeAccount.username}.webp`);

        const {updateAvatar} = await import('../Profile');
        await expect(
            updateAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).rejects.toThrow();

        expect(databaseMock.Profile.update.mock.calls.length).toBe(2);
        expect(databaseMock.Profile.update.mock.calls[0]).toEqual([
            {avatar: `/avatar/${fakeAccount.username}.webp`}, {username: fakeAccount.username},
        ]);
        expect(databaseMock.Profile.update.mock.calls[1]).toEqual([
            {avatar: ''}, {username: fakeAccount.username},
        ]);

        expect(JSON.stringify(imageminMock.mock.calls.pop())).toBe(
            JSON.stringify([
                [fakeFile.path],
                {
                    destination: tempAvatarPath,
                    plugins: [
                        imageminWebp({
                            quality: 100,
                            method: 6,
                            resize: {
                                width: 250,
                                height: 250,
                            },
                        }),
                    ],
                },
            ]),
        );

        expect(fseMock.move.mock.calls.pop()).toEqual([tempAvatarPath, avatarPath, {overwrite: true}]);

        expect([
            fseMock.remove.mock.calls.pop(),
            fseMock.remove.mock.calls.pop(),
            fseMock.remove.mock.calls.pop()]).toEqual(expect.arrayContaining(
            [
                [fakeFile.path],
                [tempAvatarPath],
                [avatarPath],
            ]));
    });
});