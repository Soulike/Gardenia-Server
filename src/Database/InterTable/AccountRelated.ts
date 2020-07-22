import {Account, Profile} from '../../Class';
import pool from '../Pool';
import {executeTransaction} from '../Function';

/**
 * @description 为注册操作编写的接口，可以在一个事务内完成账号和账号资料的创建
 * */
export async function register(account: Readonly<Account>, profile: Readonly<Profile>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await client.query(
                    `INSERT INTO accounts("username", "hash")
                     VALUES
                         ($1, $2)`,
                [account.username, account.hash]);
            await client.query(
                    `INSERT INTO profiles("username", "nickname", "email", "avatar")
                     VALUES
                         ($1, $2, $3, $4)`,
                [profile.username, profile.nickname, profile.email, profile.avatar]);
        });
    }
    finally
    {
        client.release();
    }
}