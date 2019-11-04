import {executeTransaction, generateParameterizedStatementAndParametersArray} from '../Function';
import pool from '../Pool';
import {Group, Repository as RepositoryClass} from '../../Class';

export async function insert(repository: Readonly<RepositoryClass>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            await client.query(`INSERT INTO repositories("username", "name", "description", "isPublic")
                                VALUES
                                    ($1, $2, $3, $4)`, [repository.username, repository.name, repository.description, repository.isPublic]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function deleteByUsernameAndName(repository: Readonly<Pick<RepositoryClass, 'username' | 'name'>>): Promise<void>
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

export async function update(repository: Readonly<RepositoryClass>, primaryKey: Readonly<Pick<RepositoryClass, 'username' | 'name'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            await client.query(`UPDATE repositories
                                SET "username"=$1,
                                    "name"=$2,
                                    "description"=$3,
                                    "isPublic"=$4
                                WHERE "username" = $5
                                  AND "name" = $6`,
                [repository.username, repository.name, repository.description, repository.isPublic, primaryKey.username, primaryKey.name]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function selectByUsernameAndName(repository: Readonly<Pick<RepositoryClass, 'username' | 'name'>>): Promise<RepositoryClass | null>
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
        return RepositoryClass.from(rows[0]);
    }
}

export async function select(repository: Readonly<Partial<RepositoryClass>>, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<RepositoryClass[]>
{
    const {parameterizedStatement, parameters} = generateParameterizedStatementAndParametersArray(repository, 'AND');
    const parameterAmount = parameters.length;
    const {rows} = await pool.query(
        `SELECT * FROM repositories WHERE ${parameterizedStatement} OFFSET $${parameterAmount + 1} LIMIT $${parameterAmount + 2}`,
        [...parameters, offset, limit]);
    return rows.map(row => RepositoryClass.from(row));
}

export async function getGroupsByUsernameAndName(repository: Readonly<Pick<RepositoryClass, 'username' | 'name'>>): Promise<Group[]>
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

export async function getGroupByUsernameAndNameAndGroupId(repository: Readonly<Pick<RepositoryClass, 'username' | 'name'>>, group: Readonly<Pick<Group, 'id'>>): Promise<Group | null>
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