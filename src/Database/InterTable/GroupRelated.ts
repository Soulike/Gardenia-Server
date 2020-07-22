import {AccountGroup, Group} from '../../Class';
import pool from '../Pool';
import {executeTransaction, generateColumnNamesAndValuesArrayAndParameterString} from '../Function';

export async function createdGroupAndReturnId(group: Readonly<Omit<Group, 'id'>>, creatorUsername: AccountGroup['username']): Promise<Group['id']>
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