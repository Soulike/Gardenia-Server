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