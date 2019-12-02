import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';
import pool from '../Pool';
import {Profile as ProfileClass} from '../../Class';

export async function update(profile: Readonly<Partial<ProfileClass>>, primaryKey: Readonly<Pick<ProfileClass, 'username'>>): Promise<void>
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

export async function selectByUsername(username: ProfileClass['username']): Promise<ProfileClass | null>
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
        return ProfileClass.from(rows[0]);
    }
}

export async function deleteByUsername(username: ProfileClass['username']): Promise<void>
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

export async function insert(profile: Readonly<ProfileClass>): Promise<void>
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