import {PullRequestComment} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

export async function insertAndReturnId(pullRequestComment: Readonly<PullRequestComment>): Promise<number>
{
    const client = await pool.connect();
    try
    {
        const {rows} = await executeTransaction(client, async client =>
        {
            const {id, ...rest} = pullRequestComment;
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(rest);
            return await client.query(`INSERT INTO "pull-request-comments" (${columnNames}) VALUES (${parameterString}) RETURNING "id"`, values);
        });
        return Number.parseInt(rows[0]['id']);
    }
    finally
    {
        client.release();
    }
}

export async function update(pullRequestComment: Readonly<Partial<PullRequestComment>>, primaryKey: Readonly<Pick<PullRequestComment, 'id'>>): Promise<void>
{
    if (Object.keys(pullRequestComment).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {id, ...rest} = pullRequestComment;
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(rest, ',');
            await executeTransaction(client, async client =>
            {
                await client.query(`UPDATE "pull-request-comments"
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

export async function select(pullRequestComment: Readonly<Partial<PullRequestComment>>): Promise<PullRequestComment[]>
{
    if (Object.keys(pullRequestComment).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(pullRequestComment, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM "pull-request-comments" WHERE ${parameterizedStatement}`,
        values);
    return rows.map(row => PullRequestComment.from(row));
}