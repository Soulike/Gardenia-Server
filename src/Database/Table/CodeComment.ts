import {CodeComment} from '../../Class';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';
import pool from '../Pool';

export async function insert(codeComment: Readonly<Omit<CodeComment, 'id'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const codeCommentCopy = {...codeComment, id: undefined};
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(codeCommentCopy);
            await client.query(`INSERT INTO code_comments (${columnNames}) VALUES (${parameterString})`, values);
        });
    }
    finally
    {
        client.release();
    }
}

export async function del(codeComment: Readonly<Pick<CodeComment, 'id'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const {id} = codeComment;
            await client.query(`DELETE
                                FROM code_comments
                                WHERE id = $1`, [id]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function selectByRepositoryAndFilePath(codeComment: Readonly<Pick<CodeComment, 'repositoryUsername' | 'repositoryName' | 'filePath'>>): Promise<CodeComment[]>
{
    // 按照 id 从大到小排序
    const {repositoryUsername, repositoryName, filePath} = codeComment;
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray({
        repositoryUsername,
        repositoryName,
        filePath,
    }, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM code_comments WHERE ${parameterizedStatement} ORDER BY "id" DESC`,
        values);
    return rows.map(row => CodeComment.from(row));
}

export async function selectById(codeComment: Readonly<Pick<CodeComment, 'id'>>): Promise<CodeComment | null>
{
    const {id} = codeComment;
    const {rows} = await pool.query(`SELECT *
                                     FROM code_comments
                                     WHERE id = $1`, [id]);
    if (rows.length !== 1)
    {
        return null;
    }
    return CodeComment.from(rows[0]);
}

export async function update(codeComment: Readonly<Partial<Omit<CodeComment, 'id'>>>, primaryKey: Readonly<Pick<CodeComment, 'id'>>): Promise<void>
{
    if (Object.keys(codeComment).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const codeCommentCopy = {...codeComment, id: undefined};
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(codeCommentCopy, ',');
            await executeTransaction(client, async client =>
            {
                await client.query(`UPDATE "code_comments"
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