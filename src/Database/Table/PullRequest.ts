import {PullRequest} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

export async function insertAndReturnId(pullRequest: Readonly<PullRequest>): Promise<number>
{
    const client = await pool.connect();
    try
    {
        const {rows} = await executeTransaction(client, async client =>
        {
            const {id, ...rest} = pullRequest;
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(rest);
            return await client.query(`INSERT INTO "pull-requests" (${columnNames}) VALUES (${parameterString}) RETURNING "id"`, values);
        });
        return Number.parseInt(rows[0]['id']);
    }
    finally
    {
        client.release();
    }
}

export async function update(pullRequest: Readonly<Partial<PullRequest>>, primaryKey: Readonly<Pick<PullRequest, 'id'>>): Promise<void>
{
    if (Object.keys(pullRequest).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {id, ...rest} = pullRequest;
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(rest, ',');
            await executeTransaction(client, async client =>
            {
                await client.query(`UPDATE "pull-requests"
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

export async function select(pullRequest: Readonly<Partial<PullRequest>>, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<PullRequest[]>
{
    if (Object.keys(pullRequest).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(pullRequest, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM "pull-requests" WHERE ${parameterizedStatement} ORDER BY "no" DESC OFFSET ${offset} LIMIT ${limit}`,
        values);
    return rows.map(row => PullRequest.from(row));
}

export async function count(pullRequest: Readonly<Partial<PullRequest>>): Promise<number>
{
    if (Object.keys(pullRequest).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(pullRequest, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS "count" FROM "pull-requests" WHERE ${parameterizedStatement}`,
        values);
    return Number.parseInt(rows[0]['count']);
}