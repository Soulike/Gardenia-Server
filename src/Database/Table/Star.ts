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

export async function del(star: Readonly<Partial<AccountRepository>>): Promise<void>
{
    if (Object.keys(star).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(star, 'AND');
            await client.query(`DELETE
                            FROM stars
                            WHERE ${parameterizedStatement}`,
                values);
        }
        finally
        {
            client.release();
        }
    }
}

export async function select(star: Readonly<Partial<AccountRepository>>): Promise<AccountRepository[]>
{
    if (Object.keys(star).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(star, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM stars WHERE ${parameterizedStatement}`,
        values);
    return rows.map(row => AccountRepository.from(row));
}

export async function count(star: Readonly<Partial<AccountRepository>>): Promise<number>
{
    if (Object.keys(star).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(star, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS count FROM stars WHERE ${parameterizedStatement}`,
        values);
    return Number.parseInt(rows[0]['count']);
}