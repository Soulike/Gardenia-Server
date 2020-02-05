import {AccountRepository} from '../../Class';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';
import pool from '../Pool';

export async function insert(star: Readonly<AccountRepository>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(star);
            await client.query(`INSERT INTO stars (${columnNames}) VALUES (${parameterString})`, values);
        });
    }
    finally
    {
        client.release();
    }
}

export async function del(star: Readonly<AccountRepository>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        const {username, repository_username, repository_name} = star;
        await client.query(`DELETE
                            FROM stars
                            WHERE username = $1
                              AND repository_username = $2
                              AND repository_name = $3`,
            [username, repository_username, repository_name]);
    }
    finally
    {
        client.release();
    }
}

export async function select(star: Readonly<Partial<AccountRepository>>): Promise<AccountRepository[]>
{
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(star, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM stars WHERE ${parameterizedStatement}`,
        values);
    return rows.map(row => AccountRepository.from(row));
}

export async function count(star: Readonly<Partial<AccountRepository>>): Promise<number>
{
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(star, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) as count FROM stars WHERE ${parameterizedStatement}`,
        values);
    return Number.parseInt(rows[0]['count']);
}