import {AccountGroup} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

export async function insert(accountGroup: Readonly<AccountGroup>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(accountGroup);
            await client.query(`INSERT INTO account_group (${columnNames}) VALUES (${parameterString})`, values);
        });
    }
    finally
    {
        client.release();
    }
}

export async function del(accountGroup: Readonly<Partial<AccountGroup>>): Promise<void>
{
    if (Object.keys(accountGroup).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(accountGroup, 'AND');
            await client.query(`DELETE
                            FROM account_group
                            WHERE ${parameterizedStatement}`, values);
        }
        finally
        {
            client.release();
        }
    }
}

export async function select(accountGroup: Readonly<Partial<AccountGroup>>): Promise<AccountGroup[]>
{
    if (Object.keys(accountGroup).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(accountGroup, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM account_group WHERE ${parameterizedStatement}`,
        values);
    return rows.map(row => AccountGroup.from(row));
}

export async function count(accountGroup: Readonly<Partial<AccountGroup>>): Promise<number>
{
    if (Object.keys(accountGroup).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(accountGroup, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS "count" FROM account_group WHERE ${parameterizedStatement}`,
        values);
    return Number.parseInt(rows[0]['count']);
}

export async function update(accountGroup: Readonly<Partial<AccountGroup>>, primaryKey: Readonly<Pick<AccountGroup, 'username' | 'groupId'>>): Promise<void>
{
    if (Object.keys(accountGroup).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(accountGroup, ',');
            await executeTransaction(client, async client =>
            {
                await client.query(`UPDATE "account_group"
                                SET ${parameterizedStatement}
                                WHERE "username" = $${values.length + 1}
                                AND "groupId" = $${values.length + 2}`,
                    [...values, primaryKey.username, primaryKey.groupId]);
            });
        }
        finally
        {
            client.release();
        }
    }
}