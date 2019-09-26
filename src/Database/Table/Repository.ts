import {transaction} from '../Function';
import pool from '../Pool';
import {Repository as RepositoryClass} from '../../Class';

const insertStatement = 'INSERT INTO repositories(username, name, description, ispublic) VALUES ($1, $2, $3, $4)';
const delStatement = 'DELETE FROM repositories WHERE username=$1 AND name=$2';
const updateStatement = 'UPDATE repositories SET username=$1, name=$2, description=$3, ispublic=$4 WHERE username=$1 AND name=$2';
const selectStatement = 'SELECT * FROM repositories WHERE username=$1 AND name=$2';

export namespace Repository
{
    export async function insert(repository: RepositoryClass): Promise<void>
    {
        await transaction(pool, async pool =>
        {
            await pool.query(insertStatement, [repository.username, repository.name, repository.description, repository.isPublic]);
        });
    }

    export async function del(username: RepositoryClass['username'], name: RepositoryClass['name']): Promise<void>
    {
        await transaction(pool, async pool =>
        {
            await pool.query(delStatement, [username, name]);
        });
    }

    export async function update(repository: RepositoryClass): Promise<void>
    {
        await transaction(pool, async pool =>
        {
            await pool.query(updateStatement, [repository.username, repository.name, repository.description, repository.isPublic]);
        });
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