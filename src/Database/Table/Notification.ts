import {Notification} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

export async function insert(notification: Readonly<Omit<Notification, 'id'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString({
                ...notification,
                id: undefined,  // 删除 id
            });
            await client.query(`INSERT INTO notifications (${columnNames}) VALUES (${parameterString})`, values);
        });
    }
    finally
    {
        client.release();
    }
}

export async function select(notification: Readonly<Partial<Notification>>, offset: number, limit: number): Promise<Notification[]>
{
    if (Object.keys(notification).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(notification, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM "notifications" 
WHERE ${parameterizedStatement} 
ORDER BY "confirmed" DESC, "timestamp" DESC 
OFFSET ${offset} LIMIT ${limit}`,
        values);
    return rows.map(row => Notification.from(row));
}

export async function selectById(id: Notification['id']): Promise<Notification | null>
{
    const {rows, rowCount} = await pool.query(
            `SELECT *
             FROM notifications
             WHERE "id" = $1`,
        [id]);
    if (rowCount === 0)
    {
        return null;
    }
    else
    {
        return Notification.from(rows[0]);
    }
}

export async function count(notification: Readonly<Partial<Notification>>): Promise<number>
{
    if (Object.keys(notification).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(notification, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS "count" FROM profiles WHERE ${parameterizedStatement}`,
        [...values]);
    return Number.parseInt(rows[0]['count']);
}

export async function update(notification: Readonly<Omit<Partial<Notification>, 'id'>>, primaryKey: Pick<Notification, 'id'>): Promise<void>
{
    if (Object.keys(notification).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray({
                ...notification,
                id: undefined,
            }, ',');
            await executeTransaction(client, async client =>
            {
                await client.query(
                    `UPDATE notifications
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