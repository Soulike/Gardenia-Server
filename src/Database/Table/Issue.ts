import {Issue, IssueComment} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

/**
 * @description 一并插入 Issue 及对应 Comment
 * */
export async function insertAndReturnId(issue: Readonly<Omit<Issue, 'id'>>, issueComment: Readonly<Omit<IssueComment, 'id' | 'username' | 'belongsTo'>>): Promise<number>
{
    const client = await pool.connect();
    try
    {
        const {rows} = await executeTransaction(client, async client =>
        {
            const {values: issueValues, columnNames: issueColumnNames, parameterString: issueParameterString} = generateColumnNamesAndValuesArrayAndParameterString(issue);
            const result = await client.query(`INSERT INTO "issues" (${issueColumnNames}) VALUES (${issueParameterString}) RETURNING "id"`, issueValues);

            const issueId = Number.parseInt(result['rows'][0]['id']);
            const {username} = issue;
            const {values: commentValues, columnNames: commentColumnNames, parameterString: commentParameterString} =
                generateColumnNamesAndValuesArrayAndParameterString(<IssueComment>{
                    ...issueComment,
                    id: undefined,
                    username,
                    belongsTo: issueId,
                });
            await client.query(`INSERT INTO "issue-comments" (${commentColumnNames}) VALUES (${commentParameterString})`, commentValues);
            return result;
        });
        return Number.parseInt(rows[0]['id']);
    }
    finally
    {
        client.release();
    }
}

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

export async function selectMaxNoOfRepository(issue: Readonly<Pick<Issue, 'repositoryUsername' | 'repositoryName'>>): Promise<number>
{
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(issue, 'AND');
    const {rows} = await pool.query(
        `SELECT CASE COUNT("no") WHEN 0 THEN 0 ELSE MAX("no") END AS "maxNo" FROM "issues" WHERE ${parameterizedStatement}`,
        values);
    return Number.parseInt(rows[0]['maxNo']);
}