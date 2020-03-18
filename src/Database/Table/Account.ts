import {Account, Profile} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

export async function selectByUsername(username: Account['username']): Promise<Account | null>
{
    const {rows, rowCount} = await pool.query(
            `SELECT *
             FROM accounts
             WHERE "username" = $1`,
        [username]);
    if (rowCount === 0)
    {
        return null;
    }
    else
    {
        return Account.from(rows[0]);
    }
}

export async function update(account: Readonly<Partial<Account>>, primaryKey: Readonly<Pick<Account, 'username'>>): Promise<void>
{
    if (Object.keys(account).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(account, ',');
            await executeTransaction(client, async (client) =>
            {
                await client.query(
                    `UPDATE accounts
                     SET ${parameterizedStatement}
                     WHERE "username" = $${values.length + 1}`,
                    [...values, primaryKey.username]);
            });
        }
        finally
        {
            client.release();
        }
    }
}

export async function insert(account: Readonly<Account>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(account);
            await client.query(`INSERT INTO accounts (${columnNames}) VALUES (${parameterString})`, values);
        });
    }
    finally
    {
        client.release();
    }
}

export async function deleteByUsername(username: Account['username']): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await client.query(
                    `DELETE
                     FROM accounts
                     WHERE "username" = $1`,
                [username]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function count(account: Readonly<Partial<Account>>): Promise<number>
{
    if (Object.keys(account).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(account, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS "count" FROM accounts WHERE ${parameterizedStatement}`,
        [...values]);
    return Number.parseInt(rows[0]['count']);
}

/**
 * @description 为注册操作编写的接口，可以在一个事务内完成账号和账号资料的创建
 * */
export async function create(account: Readonly<Account>, profile: Readonly<Profile>): Promise<void>
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