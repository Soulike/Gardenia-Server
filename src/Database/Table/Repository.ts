import {transaction} from '../Function';
import pool from '../Pool';
import {Repository as RepositoryClass} from '../../Class';

export namespace Repository
{
    export const insertStatement = 'INSERT INTO repositories(username, name, description, ispublic) VALUES ($1, $2, $3, $4)';
    export const delStatement = 'DELETE FROM repositories WHERE username=$1 AND name=$2';
    export const updateStatement = 'UPDATE repositories SET username=$1, name=$2, description=$3, ispublic=$4 WHERE username=$1 AND name=$2';
    export const selectStatement = 'SELECT * FROM repositories WHERE username=$1 AND name=$2';

    export async function insert(repository: RepositoryClass): Promise<void>
    {
        const client = await pool.connect();
        try
        {
            await transaction(client, async client =>
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
            await transaction(client, async client =>
            {
                await client.query(delStatement, [username, name]);
            });
        }
        finally
        {
            client.release();
        }
    }

    export async function update(repository: RepositoryClass): Promise<void>
    {
        const client = await pool.connect();
        try
        {
            await transaction(client, async client =>
            {
                await client.query(updateStatement, [repository.username, repository.name, repository.description, repository.isPublic]);
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
}