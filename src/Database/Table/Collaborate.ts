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

export async function del(collaborate: Readonly<Partial<AccountRepository>>): Promise<void>
{
    if (Object.keys(collaborate).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(collaborate, 'AND');
            await client.query(`DELETE
                            FROM collaborates
                            WHERE ${parameterizedStatement}`, values);
        }
        finally
        {
            client.release();
        }
    }
}

export async function select(collaborate: Readonly<Partial<AccountRepository>>): Promise<AccountRepository[]>
{
    if (Object.keys(collaborate).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(collaborate, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM collaborates WHERE ${parameterizedStatement}`,
        values);
    return rows.map(row => AccountRepository.from(row));
}

export async function count(collaborate: Readonly<Partial<AccountRepository>>): Promise<number>
{
    if (Object.keys(collaborate).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(collaborate, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS count FROM collaborates WHERE ${parameterizedStatement}`,
        values);
    return Number.parseInt(rows[0]['count']);
}