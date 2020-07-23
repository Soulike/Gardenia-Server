import {Issue} from '../../Class';
import pool from '../Pool';
import {executeTransaction, generateParameterizedStatementAndValuesArray} from '../Function';

export async function update(issue: Readonly<Partial<Issue>>, primaryKey: Readonly<Pick<Issue, 'id'>>): Promise<void>
{
    if (Object.keys(issue).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {id, ...rest} = issue;
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(rest, ',');
            await executeTransaction(client, async client =>
            {
                await client.query(`UPDATE "issues"
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

export async function select(issue: Readonly<Partial<Issue>>, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Issue[]>
{
    if (Object.keys(issue).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(issue, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM "issues" WHERE ${parameterizedStatement} ORDER BY "no" DESC OFFSET ${offset} LIMIT ${limit}`,
        values);
    return rows.map(row => Issue.from(row));
}

export async function count(issue: Readonly<Partial<Issue>>): Promise<number>
{
    if (Object.keys(issue).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(issue, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS "count" FROM "issues" WHERE ${parameterizedStatement}`,
        values);
    return Number.parseInt(rows[0]['count']);
}