import {IssueComment} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

export async function insertAndReturnId(issueComment: Readonly<Omit<IssueComment, 'id'>>): Promise<number>
{
    const client = await pool.connect();
    try
    {
        const {rows} = await executeTransaction(client, async client =>
        {
            const {values: commentValues, columnNames: commentColumnNames, parameterString: commentParameterString} = generateColumnNamesAndValuesArrayAndParameterString(issueComment);
            return await client.query(`INSERT INTO "issue-comments" (${commentColumnNames}) VALUES (${commentParameterString}) RETURNING "id"`, commentValues);
        });
        return Number.parseInt(rows[0]['id']);
    }
    finally
    {
        client.release();
    }
}

export async function update(issueComment: Readonly<Partial<IssueComment>>, primaryKey: Readonly<Pick<IssueComment, 'id'>>): Promise<void>
{
    if (Object.keys(issueComment).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {id, ...rest} = issueComment;
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(rest, ',');
            await executeTransaction(client, async client =>
            {
                await client.query(`UPDATE "issue-comments"
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

export async function select(issueComment: Readonly<Partial<IssueComment>>, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<IssueComment[]>
{
    if (Object.keys(issueComment).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(issueComment, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM "issue-comments" WHERE ${parameterizedStatement} ORDER BY "creationTime" OFFSET ${offset} LIMIT ${limit}`,
        values);
    return rows.map(row => IssueComment.from(row));
}