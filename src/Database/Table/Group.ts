import {AccountGroup, Group} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

export async function insertAndReturnId(group: Readonly<Omit<Group, 'id'>>, creatorUsername: AccountGroup['username']): Promise<Group['id']>
{
    const client = await pool.connect();
    // 防止 ID 传入
    const processedGroup = Group.from({id: -1, ...group});
    const {id, ...rest} = processedGroup;
    try
    {
        return await executeTransaction(client, async (client) =>
        {
            // 插入小组
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(rest);
            const result = await client.query(
                `INSERT INTO groups (${columnNames}) VALUES (${parameterString}) RETURNING id`,
                values);
            // 获取小组的 ID
            const {rows} = result;
            const groupId = Number.parseInt(rows[0]['id']);

            // 同时插入创建者的组员管理员身份
            await client.query(`INSERT INTO "account_group" (username, "groupId", "isAdmin")
                                VALUES
                                    ($1, $2, $3)`,
                [creatorUsername, groupId, true]);

            // 返回小组 ID
            return groupId;
        });
    }
    finally
    {
        client.release();
    }
}

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