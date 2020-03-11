import {Account, Profile, ResponseBody, ServiceResponse} from '../Class';
import {Profile as ProfileTable} from '../Database';
import {Session} from 'koa-session';
import {File} from 'formidable';
import imagemin from 'imagemin';
import path from 'path';
import fse from 'fs-extra';
import os from 'os';
import {SERVER} from '../CONFIG';

const imageminJpegRecompress = require('imagemin-jpeg-recompress');

export async function get(session: Readonly<Session>, account?: Readonly<Pick<Account, 'username'>>): Promise<ServiceResponse<Profile | void>>
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
    return new ServiceResponse<Profile>(200, {},
        new ResponseBody<Profile>(true, '', profile));
}

export async function set(profile: Readonly<Partial<Omit<Profile, 'avatar' | 'username'>>>, session: Readonly<Session>): Promise<ServiceResponse<void>>
{
    const {username} = session;
    const {email} = profile;
    if (typeof email === 'string')
    {
        if (await ProfileTable.count({email}) !== 0)
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
    if (await ProfileTable.count({username}) === 0)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, '用户不存在'));
    }
    /*
    * 1. 将头像转换到 webp 临时文件
    * 2. 更新数据库为新路径
    * 3. 将 webp 临时文件移动到新路径
    * */
    const {path: avatarUploadPath, hash: fileHash} = avatar;
    const avatarFileName = `${username}_${fileHash}.jpg`;
    const avatarPath = path.join(SERVER.STATIC_FILE_PATH, 'avatar', avatarFileName);
    const tempAvatarPath = path.join(os.tmpdir(), `${path.basename(avatarUploadPath)}`);
    try
    {
        await imagemin([avatarUploadPath], {
            destination: os.tmpdir(),
            plugins: [
                imageminJpegRecompress(),
            ],
        });
        await fse.move(tempAvatarPath, avatarPath, {overwrite: true});
        await ProfileTable.update({avatar: `/avatar/${avatarFileName}`}, {username});
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