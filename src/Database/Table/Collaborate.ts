import {AccountRepository} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

export async function insert(collaborate: Readonly<AccountRepository>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(collaborate);
            await client.query(`INSERT INTO collaborates (${columnNames}) VALUES (${parameterString})`, values);
        });
    }
    finally
    {
        client.release();
    }
}

export async function del(collaborate: Readonly<AccountRepository>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        const {username, repository_username, repository_name} = collaborate;
        await client.query(`DELETE
                            FROM collaborates
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

export async function select(collaborate: Readonly<Partial<AccountRepository>>): Promise<AccountRepository[]>
{
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(collaborate, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM collaborates WHERE ${parameterizedStatement}`,
        values);
    return rows.map(row => AccountRepository.from(row));
}

export async function count(collaborate: Readonly<Partial<AccountRepository>>): Promise<number>
{
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(collaborate, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS count FROM collaborates WHERE ${parameterizedStatement}`,
        values);
    return Number.parseInt(rows[0]['count']);
}