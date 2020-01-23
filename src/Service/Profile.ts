import {Account, Profile as ProfileClass, ResponseBody, ServiceResponse} from '../Class';
import {Profile as ProfileTable} from '../Database';
import {Session} from 'koa-session';
import {File} from 'formidable';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import path from 'path';
import fse from 'fs-extra';
import os from 'os';
import {SERVER} from '../CONFIG';

export async function get(session: Readonly<Session>, account?: Readonly<Pick<Account, 'username'>>): Promise<ServiceResponse<ProfileClass | void>>
{
    if (typeof account === 'undefined' && typeof session.username !== 'string')
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '用户不存在'));
    }
    const {username} = account || session;
    const profile = await ProfileTable.selectByUsername(username);
    if (profile === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '用户不存在'));
    }
    return new ServiceResponse<ProfileClass>(200, {},
        new ResponseBody<ProfileClass>(true, '', profile));
}

export async function set(profile: Readonly<Partial<Omit<ProfileClass, 'avatar' | 'username'>>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {username} = session;
    const {email} = profile;
    if (typeof email === 'string')
    {
        const profileByEmail = await ProfileTable.selectByEmail(email);
        if (profileByEmail !== null)
        {
            return new ServiceResponse<void>(200, {},
                new ResponseBody(false, '邮箱已被使用'));
        }
    }
    await ProfileTable.update(profile, {username});
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function uploadAvatar(avatar: Readonly<File>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {username} = session;
    /*
    * 1. 将头像转换到 webp 临时文件
    * 2. 更新数据库为新路径
    * 3. 将 webp 临时文件移动到新路径
    * */
    const {path: avatarUploadPath, hash: fileHash} = avatar;
    const avatarFileName = `${username}_${fileHash}.webp`;
    const avatarPath = path.join(SERVER.STATIC_FILE_PATH, 'avatar', avatarFileName);
    const tempAvatarPath = path.join(os.tmpdir(), `${path.basename(avatarUploadPath)}.webp`);
    try
    {
        await imagemin([avatarUploadPath], {
            destination: os.tmpdir(),
            plugins: [
                imageminWebp({
                    quality: 100,
                    method: 6,
                    resize: {
                        width: 500,
                        height: 500,
                    },
                }),
            ],
        });
        await ProfileTable.update({avatar: `/avatar/${avatarFileName}`}, {username});
        try
        {
            await fse.move(tempAvatarPath, avatarPath, {overwrite: true});
        }
        catch (e)   // 如果最后的 move 失败，用户头像不变
        {
            await Promise.all([
                fse.remove(avatarPath),
            ]);
            throw e;
        }
    }
    finally // 转换或数据库修改失败，数据库会自己回滚，最后必须删除所有临时文件
    {
        await Promise.all([
            fse.remove(avatarUploadPath),
            fse.remove(tempAvatarPath),
        ]);
    }
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}