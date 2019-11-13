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

const fakeProfile = new Profile(faker.random.word(), faker.name.firstName(), faker.internet.email(), '');

describe(get, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should check session', async function ()
    {
        const mockObject = {
            Profile: {
                selectByUsername: jest.fn().mockResolvedValue(fakeProfile),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {get} = await import('../Profile');
        expect(get({} as unknown as Session)).rejects.toEqual(new InvalidSessionError());
        expect(mockObject.Profile.selectByUsername.mock.calls.length).toBe(0);
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

describe(set, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should check session', async function ()
    {
        const databaseMock = {
            Profile: {
                update: jest.fn().mockResolvedValue(undefined),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        await expect(set({}, {} as unknown as Session)).rejects.toBeInstanceOf(InvalidSessionError);
        expect(databaseMock.Profile.update.mock.calls.length).toBe(0);
    });

    it('should set profile', async function ()
    {
        const databaseMock = {
            Profile: {
                update: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
        const fakeProfile: Partial<Omit<Profile, 'avatar' | 'username'>> = {
            email: faker.internet.email(),
            nickname: faker.name.firstName(),
        };
        jest.mock('../../Database', () => databaseMock);
        const {set} = await import('../Profile');
        expect(
            await set(fakeProfile, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));
        expect(databaseMock.Profile.update.mock.calls.length).toBe(1);
        expect(databaseMock.Profile.update.mock.calls[0]).toEqual([
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
    });

    it('should check session', async function ()
    {
        const databaseMock = {
            Profile: {
                update: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fakeFile: File = {
            size: 0,
            path: '',
            name: faker.random.word(),
            type: '',
            lastModifiedDate: faker.date.past(),
            hash: faker.random.alphaNumeric(64),
            toJSON: () => ({}),
        };
        jest.mock('../../Database', () => databaseMock);
        await expect(updateAvatar(fakeFile, {} as unknown as Session)).rejects.toBeInstanceOf(InvalidSessionError);
        expect(databaseMock.Profile.update.mock.calls.length).toBe(0);
    });

    it('should modify avatar', async function ()
    {
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const databaseMock = {
            Profile: {
                update: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            move: jest.fn().mockResolvedValue(undefined),
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const imageminMock = jest.fn().mockResolvedValue(undefined);
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

        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('imagemin', () => imageminMock);

        const {updateAvatar} = await import('../Profile');
        expect(
            await updateAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));
        expect(databaseMock.Profile.update.mock.calls.length).toBe(1);
        expect(databaseMock.Profile.update.mock.calls[0]).toEqual([
            {avatar: `/avatar/${fakeAccount.username}.webp`}, {username: fakeAccount.username},
        ]);

        expect(imageminMock.mock.calls.length).toBe(1);
        expect(JSON.stringify(imageminMock.mock.calls[0])).toBe(JSON.stringify(
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

        expect(fseMock.move.mock.calls.length).toBe(1);
        expect(fseMock.move.mock.calls[0]).toEqual([tempAvatarPath, avatarPath, {overwrite: true}]);

        expect(fseMock.remove.mock.calls.length).toBe(2);
        expect(fseMock.remove.mock.calls).toEqual(expect.arrayContaining(
            [
                [fakeFile.path],
                [tempAvatarPath],
            ]));
    });

    it('should process imagemin error', async function ()
    {
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const databaseMock = {
            Profile: {
                update: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            move: jest.fn().mockResolvedValue(undefined),
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const imageminMock = jest.fn().mockRejectedValue(new Error());
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

        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('imagemin', () => imageminMock);

        const {updateAvatar} = await import('../Profile');
        await expect(
            updateAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).rejects.toThrow();

        expect(databaseMock.Profile.update.mock.calls.length).toBe(0);

        expect(imageminMock.mock.calls.length).toBe(1);
        expect(JSON.stringify(imageminMock.mock.calls[0])).toBe(JSON.stringify(
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

        expect(fseMock.remove.mock.calls.length).toBe(2);
        expect(fseMock.remove.mock.calls).toEqual(expect.arrayContaining(
            [
                [fakeFile.path],
                [tempAvatarPath],
            ]));
    });

    it('should process database error', async function ()
    {
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const databaseMock = {
            Profile: {
                update: jest.fn().mockRejectedValue(new Error()),
            },
        };
        const fseMock = {
            move: jest.fn().mockResolvedValue(undefined),
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const imageminMock = jest.fn().mockResolvedValue(undefined);
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

        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('imagemin', () => imageminMock);

        const {updateAvatar} = await import('../Profile');
        await expect(
            updateAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).rejects.toThrow();

        expect(databaseMock.Profile.update.mock.calls.length).toBe(1);
        expect(databaseMock.Profile.update.mock.calls[0]).toEqual([
            {avatar: `/avatar/${fakeAccount.username}.webp`}, {username: fakeAccount.username},
        ]);

        expect(imageminMock.mock.calls.length).toBe(1);
        expect(JSON.stringify(imageminMock.mock.calls[0])).toBe(JSON.stringify(
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

        expect(fseMock.remove.mock.calls.length).toBe(2);
        expect(fseMock.remove.mock.calls).toEqual(expect.arrayContaining(
            [
                [fakeFile.path],
                [tempAvatarPath],
            ]));
    });

    it('should process fse move error', async function ()
    {
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const databaseMock = {
            Profile: {
                update: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            move: jest.fn().mockRejectedValue(new Error()),
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const imageminMock = jest.fn().mockResolvedValue(undefined);
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

        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('imagemin', () => imageminMock);

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

        expect(imageminMock.mock.calls.length).toBe(1);
        expect(JSON.stringify(imageminMock.mock.calls[0])).toBe(JSON.stringify(
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

        expect(fseMock.move.mock.calls.length).toBe(1);
        expect(fseMock.move.mock.calls[0]).toEqual([tempAvatarPath, avatarPath, {overwrite: true}]);

        expect(fseMock.remove.mock.calls.length).toBe(3);
        expect(fseMock.remove.mock.calls).toEqual(expect.arrayContaining(
            [
                [fakeFile.path],
                [tempAvatarPath],
                [avatarPath],
            ]));
    });
});