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
        if (!Account.validate({username, hash}))
        {
            throw new TypeError('Account constructor parameter type is incorrect');
        }
        this.username = username;
        this.hash = hash;
    }

    static validate(obj: Record<keyof Account, any>): boolean
    {
        const {username, hash} = obj;
        return typeof username === 'string'
            && typeof hash === 'string';
    }

    static from(obj: Record<keyof Account, any>)
    {
        const {username, hash} = obj;
        return new Account(username, hash);
    }
}