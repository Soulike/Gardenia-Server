import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';
import pool from '../Pool';
import {Group, Repository, RepositoryRepository} from '../../Class';

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

export async function deleteByUsernameAndName(repository: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        const {username, name} = repository;
        await executeTransaction(client, async client =>
        {
            await client.query(`DELETE
                                FROM repositories
                                WHERE "username" = $1
                                  AND "name" = $2`, [username, name]);
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
                                                 AND "name" = $2`, [username, name]);
    if (rowCount === 0)
    {
        return null;
    }
    else
    {
        return Repository.from(rows[0]);
    }
}

export async function select(repository: Readonly<Partial<Repository>>, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Repository[]>
{
    if (Object.keys(repository).length === 0)
    {
        return [];
    }
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(repository, 'AND');
    const parameterAmount = values.length;
    const {rows} = await pool.query(
        `SELECT * FROM repositories WHERE ${parameterizedStatement} OFFSET $${parameterAmount + 1} LIMIT $${parameterAmount + 2}`,
        [...values, offset, limit]);
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
        `SELECT COUNT(*) AS "count" FROM repositories WHERE ${parameterizedStatement}`,
        [...values]);
    return Number.parseInt(rows[0]['count']);
}

export async function getGroupsByUsernameAndName(repository: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<Group[]>
{
    const {rows} = await pool.query(`SELECT *
                                     FROM repositories     r,
                                          repository_group rg,
                                          groups           g
                                     WHERE r.username = rg.repository_username
                                       AND r.name = rg.repository_name
                                       AND rg.group_id = g.id
                                       AND r.username = $1
                                       AND r.name = $2`, [repository.username, repository.name]);
    return rows.map(row => Group.from(row));
}

export async function getGroupByUsernameAndNameAndGroupId(repository: Readonly<Pick<Repository, 'username' | 'name'>>, group: Readonly<Pick<Group, 'id'>>): Promise<Group | null>
{
    const {rows, rowCount} = await pool.query(`SELECT *
                                               FROM repositories     r,
                                                    repository_group rg,
                                                    groups           g
                                               WHERE r.username = rg.repository_username
                                                 AND r.name = rg.repository_name
                                                 AND rg.group_id = g.id
                                                 AND r.username = $1
                                                 AND r.name = $2
                                                 AND g.id = $3`, [repository.username, repository.name, group.id]);
    if (rowCount !== 1)
    {
        return null;
    }
    else
    {
        return Group.from(rows[0]);
    }
}

export async function addToGroups(repository: Readonly<Pick<Repository, 'username' | 'name'>>, groupIds: Readonly<Group['id'][]>): Promise<void>
{
    const client = await pool.connect();
    const {username, name} = repository;
    try
    {
        await executeTransaction(client, async client =>
        {
            await Promise.all(groupIds.map(id => client.query(
                    `INSERT INTO repository_group (repository_username, repository_name, group_id)
                     VALUES
                         ($1, $2, $3)`,
                [username, name, id])));
        });
    }
    finally
    {
        client.release();
    }
}

export async function removeFromGroups(repository: Readonly<Pick<Repository, 'username' | 'name'>>, groupIds: Readonly<Group['id'][]>): Promise<void>
{
    const client = await pool.connect();
    const {username, name} = repository;
    try
    {
        await executeTransaction(client, async client =>
        {
            await Promise.all(groupIds.map(id => client.query(
                    `DELETE
                     FROM repository_group
                     WHERE repository_username = $1
                       AND repository_name = $2
                       AND group_id = $3`,
                [username, name, id])));
        });
    }
    finally
    {
        client.release();
    }
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