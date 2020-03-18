import {RepositoryGroup} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

export async function insert(repositoryGroup: Readonly<RepositoryGroup>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(repositoryGroup);
            await client.query(`INSERT INTO repository_group (${columnNames}) VALUES (${parameterString})`, values);
        });
    }
    finally
    {
        client.release();
    }
}

export async function del(repositoryGroup: Readonly<Partial<RepositoryGroup>>): Promise<void>
{
    if (Object.keys(repositoryGroup).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(repositoryGroup, 'AND');
            await client.query(`DELETE
                            FROM repository_group
                            WHERE ${parameterizedStatement}`, values);
        }
        finally
        {
            client.release();
        }
    }
}

export async function select(repositoryGroup: Readonly<Partial<RepositoryGroup>>): Promise<RepositoryGroup[]>
{
    if (Object.keys(repositoryGroup).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(repositoryGroup, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM repository_group WHERE ${parameterizedStatement}`,
        values);
    return rows.map(row => RepositoryGroup.from(row));
}

export async function count(repositoryGroup: Readonly<Partial<RepositoryGroup>>): Promise<number>
{
    if (Object.keys(repositoryGroup).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(repositoryGroup, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS "count" FROM repository_group WHERE ${parameterizedStatement}`,
        values);
    return Number.parseInt(rows[0]['count']);
}