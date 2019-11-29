import {Client, PoolClient} from 'pg';
import {Account, Group, Repository} from '../../Class';

export async function insertFakeAccount(client: Client | PoolClient, account: Account)
{
    await client.query(`START TRANSACTION`);
    await client.query(
            `INSERT INTO accounts (username, hash)
             VALUES
                 ($1, $2)`,
        [account.username, account.hash]);
    await client.query(`COMMIT`);
}

export async function deleteFakeAccount(client: Client | PoolClient, username: Account['username'])
{
    await client.query(`START TRANSACTION`);
    await client.query(`DELETE
                        FROM accounts
                        WHERE username = $1`,
        [username]);
    await client.query(`COMMIT`);
}

export async function insertFakeGroupAndReturnId(client: Client | PoolClient, group: Omit<Group, 'id'>): Promise<number>
{
    await client.query(`START TRANSACTION`);
    const {rows} = await client.query(`INSERT INTO groups (name)
                                       VALUES
                                           ($1)
                                       RETURNING "id"`, [group.name]);
    await client.query(`COMMIT`);
    return Number.parseInt(rows[0]['id']);
}

export async function deleteFakeGroupsByIds(client: Client | PoolClient, ids: Group['id'][])
{
    await client.query(`START TRANSACTION`);
    await Promise.all(ids.map(id => client.query(`DELETE
                                                  FROM groups
                                                  WHERE id = $1`, [id])));
    await client.query(`COMMIT`);
}

export async function insertRepositoryGroups(client: Client | PoolClient, repository: Pick<Repository, 'username' | 'name'>, groupIds: Group['id'][]): Promise<void>
{
    await client.query(`START TRANSACTION`);
    await Promise.all(groupIds.map(groupId => client.query(`INSERT INTO repository_group (repository_username, repository_name, group_id)
                                                            VALUES
                                                                ($1, $2, $3)`,
        [repository.username, repository.name, groupId])));
    await client.query(`COMMIT`);
}

export async function deleteRepositoryGroups(client: Client | PoolClient, repository: Pick<Repository, 'username' | 'name'>, groupIds: Group['id'][]): Promise<void>
{
    await client.query(`START TRANSACTION`);
    await Promise.all(groupIds.map(groupId => client.query(`DELETE
                                                            FROM repository_group
                                                            WHERE repository_username = $1
                                                              AND repository_name = $2
                                                              AND group_id = $3`,
        [repository.username, repository.name, groupId])));
    await client.query(`COMMIT`);
}

export async function selectFakeRepository(client: Client | PoolClient, repository: Repository): Promise<Repository | null>
{
    const {rowCount, rows} = await client.query(`SELECT *
                                                 FROM repositories
                                                 WHERE username = $1
                                                   AND name = $2`,
        [repository.username, repository.name]);
    if (rowCount !== 1)
    {
        return null;
    }
    else
    {
        return Repository.from(rows[0]);
    }
}

export async function insertFakeRepository(client: Client | PoolClient, repository: Repository)
{
    await client.query(`START TRANSACTION`);
    await client.query(`INSERT INTO repositories (username, name, description, "isPublic")
                        VALUES
                            ($1, $2, $3, $4)`,
        [repository.username, repository.name, repository.description, repository.isPublic]);
    await client.query(`COMMIT`);
}

export async function insertFakeRepositories(client: Client | PoolClient, repositories: Repository[])
{
    await client.query(`START TRANSACTION`);
    await Promise.all(repositories.map(repository => client.query(`INSERT INTO repositories (username, name, description, "isPublic")
                                                                   VALUES
                                                                       ($1, $2, $3, $4)`,
        [repository.username, repository.name, repository.description, repository.isPublic])));
    await client.query(`COMMIT`);
}

export async function deleteFakeRepository(client: Client | PoolClient, repository: Repository)
{
    await client.query(`START TRANSACTION`);
    await client.query(`DELETE
                        FROM repositories
                        WHERE username = $1
                          AND name = $2`,
        [repository.username, repository.name]);
    await client.query(`COMMIT`);
}

export async function deleteFakeRepositories(client: Client | PoolClient, repositorys: Repository[])
{
    await client.query(`START TRANSACTION`);
    await Promise.all(repositorys.map(repository => client.query(`DELETE
                                                                  FROM repositories
                                                                  WHERE username = $1
                                                                    AND name = $2`,
        [repository.username, repository.name])));
    await client.query(`COMMIT`);
}