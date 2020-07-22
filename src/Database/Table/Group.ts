import {Group} from '../../Class';
import pool from '../Pool';
import {executeTransaction, generateParameterizedStatementAndValuesArray} from '../Function';

export async function deleteById(id: Group['id']): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await client.query(
                    `DELETE
                     FROM "groups"
                     WHERE "id" = $1`,
                [id]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function update(group: Readonly<Partial<Group>>, primaryKey: Readonly<Pick<Group, 'id'>>): Promise<void>
{
    if (Object.keys(group).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(group, ',');
            await executeTransaction(client, async (client) =>
            {
                await client.query(
                    `UPDATE "groups"
                     SET ${parameterizedStatement}
                     WHERE "id" = $${values.length + 1}`,
                    [...values, primaryKey.id]);
            });
        }
        finally
        {
            client.release();
        }
    }
}

export async function selectById(id: Group['id']): Promise<Group | null>
{
    const {rows, rowCount} = await pool.query(
            `SELECT *
             FROM "groups"
             WHERE "id" = $1`,
        [id]);
    if (rowCount === 1)
    {
        return Group.from(rows[0]);
    }
    else
    {
        return null;
    }
}

export async function select(group: Readonly<Partial<Group>>): Promise<Group[]>
{
    if (Object.keys(group).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(group, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM groups WHERE ${parameterizedStatement}`,
        values);
    return rows.map(row => Group.from(row));
}

export async function count(group: Readonly<Partial<Group>>): Promise<number>
{
    if (Object.keys(group).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(group, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS "count" FROM groups WHERE ${parameterizedStatement}`,
        [...values]);
    return Number.parseInt(rows[0]['count']);
}