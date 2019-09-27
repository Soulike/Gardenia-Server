import {Account as AccountClass, Profile as ProfileClass} from '../../Class';
import pool from '../Pool';
import {transaction} from '../Function';
import {Profile} from './Profile';

export namespace Account
{
    export const selectStatement = 'SELECT * FROM accounts WHERE username=$1';
    export const updateStatement = 'UPDATE accounts SET username=$1, hash=$2 WHERE username=$1';
    export const insertStatement = 'INSERT INTO accounts(username, hash) VALUES ($1, $2)';
    export const delStatement = 'DELETE FROM accounts WHERE username=$1';

    export async function select(username: AccountClass['username']): Promise<AccountClass | null>
    {
        const {rows, rowCount} = await pool.query(selectStatement, [username]);
        if (rowCount === 0)
        {
            return null;
        }
        else
        {
            return AccountClass.from(rows[0]);
        }
    }

    export async function update(account: AccountClass): Promise<void>
    {
        const client = await pool.connect();
        try
        {
            await transaction(client, async (client) =>
            {
                await client.query(updateStatement, [account.username, account.hash]);
            });
        }
        finally
        {
            client.release();
        }
    }

    export async function insert(account: AccountClass): Promise<void>
    {
        const client = await pool.connect();
        try
        {
            await transaction(client, async (client) =>
            {
                await client.query(insertStatement, [account.username, account.hash]);
            });
        }
        finally
        {
            client.release();
        }
    }

    export async function del(username: AccountClass['username']): Promise<void>
    {
        const client = await pool.connect();
        try
        {
            await transaction(client, async (client) =>
            {
                await client.query(delStatement, [username]);
            });
        }
        finally
        {
            client.release();
        }
    }

    /**
     * @description 为注册操作编写的接口，可以在一个事务内完成账号和账号资料的创建
     * */
    export async function create(account: AccountClass, profile: ProfileClass): Promise<void>
    {
        const client = await pool.connect();
        try
        {
            await transaction(client, async (client) =>
            {
                await client.query(insertStatement, [account.username, account.hash]);
                await client.query(Profile.insertStatement, [profile.username, profile.nickname, profile.email, profile.avatar]);
            });
        }
        finally
        {
            client.release();
        }
    }
}