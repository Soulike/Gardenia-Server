import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';
import pool from '../Pool';
import {Profile} from '../../Class';

export async function update(profile: Readonly<Partial<Profile>>, primaryKey: Readonly<Pick<Profile, 'username'>>): Promise<void>
{
    if (Object.keys(profile).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(profile, ',');
            await executeTransaction(client, async client =>
            {
                await client.query(
                    `UPDATE profiles
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

export async function select(profile: Readonly<Partial<Profile>>, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Profile[]>
{
    if (Object.keys(profile).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(profile, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM "profiles" WHERE ${parameterizedStatement} OFFSET ${offset} LIMIT ${limit}`,
        values);
    return rows.map(row => Profile.from(row));
}

export async function selectByUsername(username: Profile['username']): Promise<Profile | null>
{
    const {rows, rowCount} = await pool.query(
            `SELECT *
             FROM profiles
             WHERE "username" = $1`,
        [username]);
    if (rowCount === 0)
    {
        return null;
    }
    else
    {
        return Profile.from(rows[0]);
    }
}

export async function selectByEmail(email: Profile['email']): Promise<Profile | null>
{
    const {rows, rowCount} = await pool.query(
            `SELECT *
             FROM profiles
             WHERE "email" = $1`,
        [email]);
    if (rowCount === 0)
    {
        return null;
    }
    else
    {
        return Profile.from(rows[0]);
    }
}

export async function deleteByUsername(username: Profile['username']): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            await client.query(
                    `DELETE
                     FROM profiles
                     WHERE username = $1`,
                [username]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function insert(profile: Readonly<Profile>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(profile);
            await client.query(`INSERT INTO profiles (${columnNames}) VALUES (${parameterString})`, values);
        });
    }
    finally
    {
        client.release();
    }
}

export async function count(profile: Readonly<Partial<Profile>>): Promise<number>
{
    if (Object.keys(profile).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(profile, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS "count" FROM profiles WHERE ${parameterizedStatement}`,
        [...values]);
    return Number.parseInt(rows[0]['count']);
}

export async function search(keyword: string, offset: number, limit: number): Promise<Profile[]>
{
    if (keyword.length === 0)
    {
        return [];
    }

    /*此处存在的问题是如何支持大小写混合查询，如果用 LOWER 和 UPPER 会导致索引失效*/
    const {rows} = await pool.query(`SELECT DISTINCT *
                                     FROM profiles
                                     WHERE LOWER(username) LIKE LOWER($1)
                                        OR LOWER(nickname) LIKE LOWER($1)
                                        OR LOWER(email) LIKE LOWER($1)
                                     OFFSET $2 LIMIT $3`, [`%${keyword}%`, offset, limit]);
    return rows.map(row => Profile.from(row));
}