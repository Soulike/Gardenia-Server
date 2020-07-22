import {Issue, IssueComment} from '../../Class';
import pool from '../Pool';
import {executeTransaction, generateColumnNamesAndValuesArrayAndParameterString} from '../Function';

/**
 * @description 一并插入 Issue 及对应 Comment
 * */
export async function createIssueAndReturnId(issue: Readonly<Omit<Issue, 'id'>>, issueComment: Readonly<Omit<IssueComment, 'id' | 'username' | 'belongsTo'>>): Promise<number>
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