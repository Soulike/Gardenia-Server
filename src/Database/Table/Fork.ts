import {RepositoryRepository} from '../../Class';
import pool from '../Pool';
import {
    executeTransaction,
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from '../Function';

export async function insert(repositoryRepository: Readonly<RepositoryRepository>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(repositoryRepository);
            await client.query(`INSERT INTO forks (${columnNames}) VALUES (${parameterString})`, values);
        });
    }
    finally
    {
        client.release();
    }
}

export async function select(repositoryRepository: Readonly<Partial<RepositoryRepository>>): Promise<RepositoryRepository[]>
{
    const {parameterizedStatement, values} = generateParameterizedStatementAndValuesArray(repositoryRepository, 'AND');
    const {rows} = await pool.query(
        `SELECT * FROM forks WHERE ${parameterizedStatement}`,
        values);
    return rows.map(row => RepositoryRepository.from(row));
}