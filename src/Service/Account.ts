import {Account, Profile, ResponseBody, ServiceResponse} from '../Class';
import {Account as AccountTable, Profile as ProfileTable} from '../Database';
import {Authentication, Mail, Session as SessionFunction} from '../Function';
import {VERIFICATION_CODE_TYPE} from '../CONSTANT';
import {ILoggedInSession, ISession} from '../Interface';

export async function login(account: Readonly<Account>): Promise<ServiceResponse<void>>
{
    const {username, hash} = account;
    const accountInDatabase = await AccountTable.selectByUsername(username);
    if (accountInDatabase === null)   // 检查用户名是否存在
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名或密码错误'));
    }

    if (hash === accountInDatabase.hash)  // 检查密码是否正确
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true), {username: username});
    }
    else
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '用户名或密码错误'));
    }
}

export async function register(account: Readonly<Account>, profile: Readonly<Omit<Profile, 'username'>>, verificationCode: string, verificationInSession: ISession['verification']): Promise<ServiceResponse<void>>
{
    if (verificationInSession === undefined)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '验证码错误'));
    }
    const {type: verificationType, email: verificationEmail, verificationCode: verificationCodeInSession} = verificationInSession;
    const {username} = account;
    const {email} = profile;
    if (verificationType !== VERIFICATION_CODE_TYPE.REGISTER
        || email !== verificationEmail
        || verificationCode !== verificationCodeInSession)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, '验证码错误'));
    }
    if ((await AccountTable.count({username})) !== 0) // 检查用户名是不是已经存在了
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `用户名 ${username} 已存在`));
    }
    if ((await ProfileTable.count({email})) !== 0)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `邮箱 ${email} 已被使用`));
    }
    await AccountTable.create(account, {username: account.username, ...profile});
    return new ServiceResponse<void>(200, {},
        new ResponseBody<void>(true), {verification: undefined});
}

export async function checkIfUsernameAvailable(username: Account['username']): Promise<ServiceResponse<{ isAvailable: boolean }>>
{
    const count = await AccountTable.count({username});
    return new ServiceResponse<{ isAvailable: boolean }>(200, {},
        new ResponseBody(true, '', {isAvailable: count === 0}));
}

export async function sendVerificationCodeByUsername(profile: Readonly<Pick<Profile, 'username'>>): Promise<ServiceResponse<void>>
{
    // 获取用户名对应的邮箱
    const {username} = profile;
    const profileInDatabase = await ProfileTable.selectByUsername(username);
    if (profileInDatabase === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `用户名 ${username} 不存在`));
    }
    const {email} = profileInDatabase;
    const verificationCode = Authentication.generateVerificationCode();
    await Mail.sendMail({
        to: email,
        subject: 'Gardenia 修改密码验证码',
        text: `${username}，您好。您的 Gardenia 修改密码验证码为 ${verificationCode}`,
    });
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true), {
            verification: {type: VERIFICATION_CODE_TYPE.CHANGE_PASSWORD, email, verificationCode},
        });
}

export async function sendVerificationCodeToEmail(profile: Readonly<Pick<Profile, | 'email'>>): Promise<ServiceResponse<void>>
{
    const {email} = profile;
    if ((await ProfileTable.count({email})) !== 0)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody<void>(false, `邮箱 ${email} 已被使用`));
    }
    const verificationCode = Authentication.generateVerificationCode();
    await Mail.sendMail({
        to: email,
        subject: 'Gardenia 注册验证码',
        text: `您好。您的 Gardenia 注册验证码为 ${verificationCode}`,
    });
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true), {
            verification: {type: VERIFICATION_CODE_TYPE.REGISTER, email, verificationCode},
        });
}

export async function changePassword(account: Readonly<Account>, verificationCode: string, verificationInSession: Readonly<ISession['verification']>): Promise<ServiceResponse<void>>
{
    // 验证验证码是否存在
    if (verificationInSession === undefined)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '验证码错误'));
    }
    const {type, email: emailInSession, verificationCode: verificationCodeInSession} = verificationInSession;
    const {username, hash} = account;
    // 查看验证码类型是否正确
    if (type !== VERIFICATION_CODE_TYPE.CHANGE_PASSWORD)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '验证码错误'));
    }
    // 查看账号存在性
    const profile = await ProfileTable.selectByUsername(username);
    if (profile === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody(false, `用户名 ${username} 不存在`));
    }
    // 查看邮箱是否对应，验证码是否正确
    const {email} = profile;
    if (email !== emailInSession || verificationCodeInSession !== verificationCode)
    {
        return new ServiceResponse<void>(200, {},
            new ResponseBody(false, '验证码错误'));
    }
    // 修改密码，并注销 Session
    await AccountTable.update({hash}, {username});
    return new ServiceResponse<void>(200, {},
        new ResponseBody(true), {username: undefined, verification: undefined});
}

export async function checkSession(session: Readonly<ISession>): Promise<ServiceResponse<{ isValid: boolean }>>
{
    return new ServiceResponse<{ isValid: boolean }>(200, {},
        new ResponseBody(true, '', {isValid: SessionFunction.isSessionValid(session)}));
}

export async function logout(): Promise<ServiceResponse<void>>
{
    return new ServiceResponse<void>(200, {}, new ResponseBody<void>(true), {username: undefined});
}

export async function checkPassword(account: Readonly<Pick<Account, 'hash'>>, usernameInSession: ILoggedInSession['username']): Promise<ServiceResponse<{ isCorrect: boolean }>>
{
    const {hash} = account;
    const accountInDatabase = await AccountTable.selectByUsername(usernameInSession);
    if (accountInDatabase === null)
    {
        return new ServiceResponse<{ isCorrect: boolean }>(200, {},
            new ResponseBody<{ isCorrect: boolean }>(true, '', {isCorrect: false}));
    }
    const {hash: expectedHash} = accountInDatabase;
    return new ServiceResponse<{ isCorrect: boolean }>(200, {},
        new ResponseBody<{ isCorrect: boolean }>(true, '', {isCorrect: hash === expectedHash}));
}