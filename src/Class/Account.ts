import crypto from 'crypto';

/**
 * @class
 * @description 账号，对应数据库中 accounts 表
 * */
export class Account
{
    public username: string;
    public hash: string;

    constructor(username: string, hash: string)
    {
        this.username = username;
        this.hash = hash;
    }

    public static calculateHash(username: string, password: string): string
    {
        const {calculateSHA256} = Account;
        return calculateSHA256(calculateSHA256(username) + calculateSHA256(password));
    }

    public static validate(obj: Readonly<Record<keyof Account, any>>): boolean
    {
        const {username, hash} = obj;
        return typeof username === 'string'
            && typeof hash === 'string';
    }

    public static from(obj: Readonly<Record<keyof Account, any>>)
    {
        const {username, hash} = obj;
        if (!Account.validate({username, hash}))
        {
            throw new TypeError(`Source object is not a ${Account.name} instance`);
        }
        return new Account(username, hash);
    }

    private static calculateSHA256(text: string): string
    {
        const hash = crypto.createHash('sha256');
        hash.update(text);
        return hash.digest('hex');
    }
}