import {executeTransaction} from '../Function';
import pool from '../Pool';
import {Repository as RepositoryClass} from '../../Class';

export const insertStatement = 'INSERT INTO repositories("username", "name", "description", "isPublic") VALUES ($1, $2, $3, $4)';
export const delStatement = 'DELETE FROM repositories WHERE "username"=$1 AND "name"=$2';
export const updateStatement = 'UPDATE repositories SET "username"=$1, "name"=$2, "description"=$3, "isPublic"=$4 WHERE "username"=$5 AND "name"=$6';
export const selectStatement = 'SELECT * FROM repositories WHERE "username"=$1 AND "name"=$2';
export const selectByIsPublicStatement = 'SELECT * FROM "repositories" WHERE "isPublic"=$1 OFFSET $2 LIMIT $3';
export const selectByIsPublicAndUsernameStatement = 'SELECT * FROM repositories WHERE "isPublic"=$1 AND "username"=$2 OFFSET $3 LIMIT $4';
export const selectByUsernameStatement = 'SELECT * FROM repositories WHERE "username"=$1 OFFSET $2 LIMIT $3';

export async function insert(repository: RepositoryClass): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            await client.query(insertStatement, [repository.username, repository.name, repository.description, repository.isPublic]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function del(username: RepositoryClass['username'], name: RepositoryClass['name']): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            await client.query(delStatement, [username, name]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function update(repository: RepositoryClass, primaryKey?: Pick<RepositoryClass, 'username' | 'name'>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            await client.query(updateStatement,
                [repository.username, repository.name, repository.description, repository.isPublic,
                    primaryKey ? primaryKey.username : repository.username,
                    primaryKey ? primaryKey.name : repository.name]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function select(username: RepositoryClass['username'], name: RepositoryClass['name']): Promise<RepositoryClass | null>
{
    const {rows, rowCount} = await pool.query(selectStatement, [username, name]);
    if (rowCount === 0)
    {
        return null;
    }
    else
    {
        return RepositoryClass.from(rows[0]);
    }
}

export async function selectByIsPublic(isPublic: RepositoryClass['isPublic'], offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Array<RepositoryClass>>
{
    const {rows} = await pool.query(selectByIsPublicStatement, [isPublic, offset, limit]);
    return rows.map(row => RepositoryClass.from(row));
}

export async function selectByIsPublicAndUsername(isPublic: RepositoryClass['isPublic'], username: RepositoryClass['username'], offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Array<RepositoryClass>>
{
    const {rows} = await pool.query(selectByIsPublicAndUsernameStatement, [isPublic, username, offset, limit]);
    return rows.map(row => RepositoryClass.from(row));
}

export async function selectByUsername(username: RepositoryClass['username'], offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Array<RepositoryClass>>
{
    const {rows} = await pool.query(selectByUsernameStatement, [username, offset, limit]);
    return rows.map(row => RepositoryClass.from(row));
}