import {Account, Profile, ResponseBody, ServiceResponse} from '../Class';
import {Profile as ProfileTable} from '../Database';
import {File} from 'formidable';
import path from 'path';
import fse from 'fs-extra';
import {SERVER} from '../CONFIG';
import os from 'os';
import {ILoggedInSession, ISession} from '../Interface';

export async function get(usernameInSession: ISession['username'], account?: Readonly<Pick<Account, 'username'>>): Promise<ServiceResponse<Profile | null>>
{
    let username: string | null = null;
    if (account !== undefined)
    {
        username = account.username;
    }
    else if (usernameInSession === undefined)
    {
        return new ServiceResponse<null>(200, {},
            new ResponseBody(true, '', null));
    }
    else
    {
        username = usernameInSession;
    }

    const profile = await ProfileTable.selectByUsername(username);
    return new ServiceResponse<Profile | null>(200, {},
        new ResponseBody(true, '', profile));
}

export async function getByEmail(email: string): Promise<ServiceResponse<Profile | null>>
{
    const profile = await ProfileTable.selectByEmail(email);
    return new ServiceResponse<Profile | null>(200,
        {}, new ResponseBody(true, '', profile));
}

export async function set(profile: Readonly<Partial<Omit<Profile, 'avatar' | 'username'>>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {email} = profile;
    if (typeof email === 'string')
    {
        if (await ProfileTable.count({email}) !== 0)
        {
            return new ServiceResponse<void>(200, {},
                new ResponseBody(false, `邮箱 ${email} 已被使用`));
        }
    }
    await ProfileTable.update(profile, {username: usernameInSession});
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}

export async function uploadAvatar(avatar: Readonly<File>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<void>>
{
    const {path: sourceAvatarUploadPath, hash: sourceFileHash} = avatar;
    const {avatar: currentAvatar} = (await ProfileTable.selectByUsername(usernameInSession))!;// 从 session 取，不可能是 null
    const currentAvatarFilePath = path.join(SERVER.STATIC_FILE_PATH, currentAvatar);    // 现在头像的文件路径
    const currentHasAvatar = currentAvatar.length !== 0 && await fse.pathExists(currentAvatarFilePath);    // 是否当前有头像
    const currentAvatarBackupFilePath = path.join(os.tmpdir(), path.basename(currentAvatar));   // 现在头像的备份路径
    try
    {
        if (currentHasAvatar)
        {
            await fse.move(currentAvatarFilePath, currentAvatarBackupFilePath, {overwrite: true});  // 先备份现在头像
        }
        const targetAvatarFileName = `${usernameInSession}_${sourceFileHash}${path.extname(sourceAvatarUploadPath)}`;
        const targetAvatarFilePath = path.join(
            SERVER.STATIC_FILE_PATH,
            'avatar',
            targetAvatarFileName);
        await fse.move(sourceAvatarUploadPath, targetAvatarFilePath, {overwrite: true});
        await ProfileTable.update({avatar: `/avatar/${targetAvatarFileName}`}, {username: usernameInSession});
        if (currentHasAvatar)
        {
            await fse.remove(currentAvatarBackupFilePath);  // 所有操作都成功了，删除备份
        }
    }
    catch (e) // 转换或数据库修改失败，数据库会自己回滚，最后必须删除所有临时文件，恢复原本头像
    {
        await fse.remove(sourceAvatarUploadPath);
        if (currentHasAvatar)
        {
            await fse.move(currentAvatarBackupFilePath, currentAvatarFilePath, {overwrite: true});
        }
        throw e;    // 抛出错误到外层
    }
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true));
}