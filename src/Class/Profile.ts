import validator from 'validator';

/**
 * @class
 * @description 账号资料，对应数据库 profiles 表
 * */
export class Profile
{
    public username: string;
    public nickname: string;
    public avatar: string;
    public email: string;

    constructor(username: string, nickname: string, email: string, avatar: string)
    {
        if (!Profile.isEmail(email))
        {
            throw new TypeError(`${email} is not a valid email`);
        }
        this.username = username;
        this.nickname = nickname;
        this.email = email;
        this.avatar = avatar;
    }

    public static validate(obj: Readonly<Record<keyof Profile, any>>): boolean
    {
        const {username, nickname, email, avatar} = obj;
        return typeof username === 'string'
            && typeof nickname === 'string'
            && Profile.isEmail(email)
            && typeof avatar === 'string';
    }

    public static from(obj: Readonly<Record<keyof Profile, any>>): Profile
    {
        const {username, nickname, email, avatar} = obj;
        if (!Profile.validate({username, nickname, email, avatar}))
        {
            throw new TypeError(`Source object is not a ${Profile.name} instance`);
        }
        return new Profile(username, nickname, email, avatar);
    }

    private static isEmail(email: any): boolean
    {
        return typeof email === 'string' && validator.isEmail(email);
    }
}