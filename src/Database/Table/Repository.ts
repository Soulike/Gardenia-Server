import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';
import pool from '../Pool';
import {Repository, RepositoryRepository} from '../../Class';
import {PULL_REQUEST_STATUS} from '../../CONSTANT';

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
 * @description 做逻辑上的删除，连带和其他表相关的操作
 * */
export async function deleteByUsernameAndName(repository: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        const {username, name} = repository;
        await executeTransaction(client, async client =>
        {
            await Promise.all([
                // 标记删除
                client.query(`UPDATE
                                  repositories
                              SET "deleted"= TRUE
                              WHERE "username" = $1
                                AND "name" = $2`, [username, name]),
                // 删除 fork
                client.query(`DELETE
                              FROM forks
                              WHERE ("sourceRepositoryName" = $1
                                  AND "sourceRepositoryName" = $2)
                                 OR ("targetRepositoryUsername" = $1
                                  AND "targetRepositoryName" = $2)`, [username, name]),
                // 删除 star
                client.query(`DELETE
                              FROM stars
                              WHERE "repositoryUsername" = $1
                                AND "repositoryName" = $2`, [username, name]),
                // 删除关联合作者
                client.query(`DELETE
                              FROM collaborates
                              WHERE "repositoryUsername" = $1
                                AND "repositoryName" = $2`, [username, name]),
                // 删除关联小组关系
                client.query(`DELETE
                              FROM repository_group
                              WHERE "repositoryUsername" = $1
                                AND "repositoryName" = $2`, [username, name]),
                // 关闭相关 PR
                client.query(`UPDATE "pull-requests"
                              SET status=$1
                              WHERE ("sourceRepositoryUsername" = $2
                                  AND "sourceRepositoryName" = $3)
                                 OR ("targetRepositoryUsername" = $2
                                  AND "targetRepositoryName" = $3)`,
                    [PULL_REQUEST_STATUS.CLOSED, username, name]),
            ]);
        });
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
ORDER BY "starAmount" DESC OFFSET ${offset}
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

export async function fork(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>, targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const sourceRepositoryInDatabase = await selectByUsernameAndName(sourceRepository);
            const {
                values: repositoryValues,
                columnNames: repositoryColumnNames,
                parameterString: repositoryParameterString,
            } = generateColumnNamesAndValuesArrayAndParameterString({
                ...sourceRepositoryInDatabase,
                username: targetRepository.username,
                name: targetRepository.name,
            });
            await client.query(`INSERT INTO repositories (${repositoryColumnNames}) VALUES (${repositoryParameterString})`, repositoryValues);

            const repositoryRepository = new RepositoryRepository(
                sourceRepository.username, sourceRepository.name,
                targetRepository.username, targetRepository.name,
            );
            const {
                values: forkValues,
                columnNames: forkColumnNames,
                parameterString: forkParameterString,
            } = generateColumnNamesAndValuesArrayAndParameterString(repositoryRepository);
            await client.query(`INSERT INTO forks (${forkColumnNames}) VALUES (${forkParameterString})`, forkValues);
        });
    }
    finally
    {
        client.release();
    }
}