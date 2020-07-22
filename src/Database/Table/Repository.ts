import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';
import pool from '../Pool';
import {Repository} from '../../Class';

export async function insert(repository: Readonly<Repository>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(repository);
            await client.query(`INSERT INTO repositories (${columnNames}) VALUES (${parameterString})`, values);
        });
    }
    finally
    {
        client.release();
    }
}

/**
 * @description 做实际的删除
 * */
export async function deleteByUsernameAndName(repository: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        const {username, name} = repository;
        await client.query(`DELETE
                            FROM repositories
                            WHERE username = $1
                              AND name = $2`,
            [username, name]);
    }
    finally
    {
        client.release();
    }
}

export async function update(repository: Readonly<Partial<Repository>>, primaryKey: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<void>
{
    if (Object.keys(repository).length !== 0)
    {
        const client = await pool.connect();
        try
        {
            const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(repository, ',');
            await executeTransaction(client, async client =>
            {
                await client.query(`UPDATE repositories
                                SET ${parameterizedStatement}
                                WHERE "username" = $${values.length + 1}
                                  AND "name" = $${values.length + 2}`,
                    [...values, primaryKey.username, primaryKey.name]);
            });
        }
        finally
        {
            client.release();
        }
    }
}

export async function selectByUsernameAndName(repository: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<Repository | null>
{
    const {username, name} = repository;
    const {rows, rowCount} = await pool.query(`SELECT *
                                               FROM repositories
                                               WHERE "username" = $1
                                                 AND "name" = $2
                                                 AND "deleted" = FALSE`, [username, name]);
    if (rowCount === 0)
    {
        return null;
    }
    else
    {
        return Repository.from(rows[0]);
    }
}

/**
 * @description 按照 Star 数进行排序，从高到低
 * */
export async function select(repository: Readonly<Partial<Repository>>, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Repository[]>
{
    if (Object.keys(repository).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(repository, 'AND');

    const {rows} = await pool.query(
        `
SELECT "repositories".*
FROM "repositories"
         JOIN (
    SELECT "r"."username" AS "countUsername", "r"."name" AS "countName", count("s"."username") AS "starAmount"
    FROM "repositories" AS "r"
             LEFT OUTER JOIN "stars" AS "s"
                             ON "r"."username" = "s"."repositoryUsername" AND "r"."name" = "s"."repositoryName"
    GROUP BY "r"."username", "r"."name"
) AS "t" ON "username" = "countUsername" AND "name" = "countName"
WHERE ${parameterizedStatement}
  AND "deleted" = FALSE
ORDER BY "starAmount" DESC, "username", "name" OFFSET ${offset}
LIMIT ${limit}`, values);
    return rows.map(row => Repository.from(row));
}

export async function count(repository: Readonly<Partial<Repository>>): Promise<number>
{
    if (Object.keys(repository).length === 0)
    {
        return 0;
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(repository, 'AND');
    const {rows} = await pool.query(
        `SELECT COUNT(*) AS "count" FROM repositories WHERE ${parameterizedStatement} AND "deleted"=FALSE`,
        [...values]);
    return Number.parseInt(rows[0]['count']);
}