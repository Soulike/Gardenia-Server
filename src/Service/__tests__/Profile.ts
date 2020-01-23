import {get, set, uploadAvatar} from '../Profile';
import {Account, Profile as ProfileClass, Profile, ResponseBody, ServiceResponse} from '../../Class';
import {Session} from 'koa-session';
import {File} from 'formidable';
import path from 'path';
import os from 'os';
import {SERVER} from '../../CONFIG';
import {Profile as ProfileTable} from '../../Database';

const fakeProfile = new Profile('vagagaegawg', 'vahbaeh', 'a@b.com', '');

const databaseMock = {
    Profile: {
        selectByUsername: jest.fn<ReturnType<typeof ProfileTable.selectByUsername>,
            Parameters<typeof ProfileTable.selectByUsername>>(),
        selectByEmail: jest.fn<ReturnType<typeof ProfileTable.selectByEmail>,
            Parameters<typeof ProfileTable.selectByEmail>>(),
        update: jest.fn<ReturnType<typeof ProfileTable.update>,
            Parameters<typeof ProfileTable.update>>(),
    },
};

// can not use template parameters due to TypeScript limitations on overloads
const fseMock = {
    move: jest.fn(),
    remove: jest.fn(),
};
const imageminMock = jest.fn().mockResolvedValue(undefined);

describe(`${get.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
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
            {username: 'vabaeh'} as unknown as Session,
            {username: fakeProfile.username});
        expect(response).toEqual(new ServiceResponse<ProfileClass>(200, {},
            new ResponseBody<ProfileClass>(true, '', fakeProfile)));
        expect(databaseMock.Profile.selectByUsername.mock.calls.pop()).toEqual([fakeProfile.username]);
    });

    it('should throw error if can not get account', async function ()
    {
        const {get} = await import('../Profile');
        const response = await get({} as unknown as Session);
        expect(response).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '用户不存在')));
        expect(databaseMock.Profile.selectByUsername).not.toBeCalled();
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

describe(`${set.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        databaseMock.Profile.update.mockResolvedValue(undefined);
    });

    it('should set profile', async function ()
    {
        databaseMock.Profile.selectByEmail.mockResolvedValue(null);
        const fakeAccount = new Account('vaegaegawegaqg', 'a'.repeat(64));
        const fakeProfile: Partial<Omit<Profile, 'avatar' | 'username'>> = {
            email: 'vaev@gsrh.com',
            nickname: 'abkjaekjlbgaek',
        };
        const {set} = await import('../Profile');
        expect(
            await set(fakeProfile, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));
        expect(databaseMock.Profile.selectByEmail).toBeCalledTimes(1);
        expect(databaseMock.Profile.selectByEmail).toBeCalledWith(fakeProfile.email);
        expect(databaseMock.Profile.update).toBeCalledTimes(1);
        expect(databaseMock.Profile.update).toBeCalledWith(
            fakeProfile,
            {username: fakeAccount.username},
        );
    });

    it('should check email existence', async function ()
    {
        const fakeAccount = new Account('vaegaegawegaqg', 'a'.repeat(64));
        const fakeProfile: ProfileClass = {
            avatar: '',
            username: 'agaegaeg',
            email: 'vaev@gsrh.com',
            nickname: 'abkjaekjlbgaek',
        };
        databaseMock.Profile.selectByEmail.mockResolvedValue(fakeProfile);
        const {set} = await import('../Profile');
        expect(
            await set(fakeProfile, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(false, '邮箱已被使用')));
        expect(databaseMock.Profile.selectByEmail).toBeCalledTimes(1);
        expect(databaseMock.Profile.selectByEmail).toBeCalledWith(fakeProfile.email);
        expect(databaseMock.Profile.update).toBeCalledTimes(0);
    });
});

describe(`${uploadAvatar.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('imagemin', () => imageminMock);
        databaseMock.Profile.update.mockResolvedValue(undefined);
        fseMock.move.mockResolvedValue(undefined);
        fseMock.remove.mockResolvedValue(undefined);
    });

    it('should modify avatar', async function ()
    {
        const fakeAccount = new Account(
            'qahbaehrasharsh',
            'a'.repeat(64),
        );
        const fakeFile: File = {
            size: 0,
            path: path.join('gaegaeg', 'baqbaegh'),
            name: 'vagaegae',
            type: '',
            lastModifiedDate: new Date(1998, 1, 20),
            hash: 'v'.repeat(64),
            toJSON: () => ({}),
        };
        const avatarFileName = `${fakeAccount.username}_${fakeFile.hash}.webp`;
        const avatarPath = path.join(SERVER.STATIC_FILE_PATH, 'avatar', avatarFileName);
        const tempAvatarPath = path.join(os.tmpdir(), `${path.basename(fakeFile.path)}.webp`);

        const {uploadAvatar} = await import('../Profile');
        expect(
            await uploadAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));
        expect(databaseMock.Profile.update).toBeCalledWith(
            {avatar: `/avatar/${avatarFileName}`},
            {username: fakeAccount.username},
        );

        expect(imageminMock).toBeCalledWith(
            [fakeFile.path],
            {
                destination: os.tmpdir(),
                plugins: expect.anything(),
            });

        expect(fseMock.move).toBeCalledWith(tempAvatarPath, avatarPath, {overwrite: true});

        expect(fseMock.remove).toBeCalledTimes(2);
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
            'aaBAEHAEHHA',
            'b'.repeat(64),
        );
        const fakeFile: File = {
            size: 0,
            path: path.join('gaegaeg', 'baqbaegh'),
            name: 'vagaegae',
            type: '',
            lastModifiedDate: new Date(1998, 1, 20),
            hash: 'v'.repeat(64),
            toJSON: () => ({}),
        };
        const tempAvatarPath = path.join(os.tmpdir(), `${path.basename(fakeFile.path)}.webp`);

        const {uploadAvatar} = await import('../Profile');
        await expect(
            uploadAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).rejects.toThrow();

        expect(databaseMock.Profile.update).toBeCalledTimes(0);

        expect(imageminMock).toBeCalledWith(
            [fakeFile.path],
            {
                destination: os.tmpdir(),
                plugins: expect.anything(),
            });

        expect(fseMock.move).toBeCalledTimes(0);

        expect(fseMock.remove).toBeCalledTimes(2);
        expect(fseMock.remove.mock.calls).toEqual(expect.arrayContaining(
            [
                [fakeFile.path],
                [tempAvatarPath],
            ]));
    });

    it('should process database error', async function ()
    {
        databaseMock.Profile.update.mockRejectedValue(new Error());
        const fakeAccount = new Account(
            'aaBAEHAvaevaeEHHA',
            'b'.repeat(64),
        );
        const fakeFile: File = {
            size: 0,
            path: path.join('gfafaegaeg', 'baawfawqbaegh'),
            name: 'vagaawfawfegae',
            type: '',
            lastModifiedDate: new Date(1998, 1, 20),
            hash: 'c'.repeat(64),
            toJSON: () => ({}),
        };
        const avatarFileName = `${fakeAccount.username}_${fakeFile.hash}.webp`;
        const tempAvatarPath = path.join(os.tmpdir(), `${path.basename(fakeFile.path)}.webp`);
        const {uploadAvatar} = await import('../Profile');
        await expect(
            uploadAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).rejects.toThrow();

        expect(databaseMock.Profile.update).toBeCalledWith(
            {avatar: `/avatar/${avatarFileName}`},
            {username: fakeAccount.username},
        );

        expect(imageminMock).toBeCalledWith(
            [fakeFile.path],
            {
                destination: os.tmpdir(),
                plugins: expect.anything(),
            });

        expect(fseMock.move).toBeCalledTimes(0);

        expect(fseMock.remove).toBeCalledTimes(2);
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
            'aaBfafawfAEHAEHHA',
            'b'.repeat(64),
        );
        const fakeFile: File = {
            size: 0,
            path: path.join('gaawfegaeg', 'baqbawfaegh'),
            name: 'vagacawfegae',
            type: '',
            lastModifiedDate: new Date(1998, 1, 20),
            hash: 'e'.repeat(64),
            toJSON: () => ({}),
        };
        const avatarFileName = `${fakeAccount.username}_${fakeFile.hash}.webp`;
        const avatarPath = path.join(SERVER.STATIC_FILE_PATH, 'avatar', avatarFileName);
        const tempAvatarPath = path.join(os.tmpdir(), `${path.basename(fakeFile.path)}.webp`);
        const {uploadAvatar} = await import('../Profile');
        await expect(
            uploadAvatar(fakeFile, {username: fakeAccount.username} as unknown as Session),
        ).rejects.toThrow();

        expect(databaseMock.Profile.update).toBeCalledTimes(1);
        expect(databaseMock.Profile.update).toHaveBeenCalledWith(
            {avatar: `/avatar/${avatarFileName}`},
            {username: fakeAccount.username},
        );

        expect(imageminMock).toBeCalledWith(
            [fakeFile.path],
            {
                destination: os.tmpdir(),
                plugins: expect.anything(),
            });

        expect(fseMock.move).toBeCalledWith(tempAvatarPath, avatarPath, {overwrite: true});

        expect(fseMock.remove).toBeCalledTimes(3);
        expect(fseMock.remove.mock.calls).toEqual(expect.arrayContaining(
            [
                [fakeFile.path],
                [tempAvatarPath],
                [avatarPath],
            ]));
    });
});