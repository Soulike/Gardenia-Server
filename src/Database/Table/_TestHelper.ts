import {Client, PoolClient} from 'pg';
import {Account, Group, Profile, Repository} from '../../Class';

export async function insertFakeAccount(client: Client | PoolClient, account: Account)
{
    await client.query('START TRANSACTION');
    await client.query(
        'INSERT INTO accounts (username, hash) VALUES ($1, $2)',
        [account.username, account.hash]);
    await client.query('COMMIT');
}

export async function deleteFakeAccount(client: Client | PoolClient, username: Account['username'])
{
    await client.query('START TRANSACTION');
    await client.query(
        'DELETE FROM accounts WHERE username=$1',
        [username]);
    await client.query('COMMIT');
}

export async function selectFakeAccount(client: Client | PoolClient, username: Account['username']): Promise<Account | null>
{
    const {rows, rowCount} = await client.query(
        'SELECT * FROM accounts WHERE username=$1',
        [username]);
    if (rowCount === 1)
    {
        return Account.from(rows[0]);
    }
    else
    {
        return null;
    }
}

export async function insertFakeGroupAndReturnId(client: Client | PoolClient, group: Omit<Group, 'id'>): Promise<number>
{
    await client.query('START TRANSACTION');
    const {rows} = await client.query('INSERT INTO groups (name) VALUES ($1) RETURNING "id"', [group.name]);
    await client.query('COMMIT');
    return Number.parseInt(rows[0]['id']);
}

export async function selectFakeGroupById(client: Client | PoolClient, id: Group['id']): Promise<Group | null>
{
    const {rows, rowCount} = await client.query('SELECT * FROM groups WHERE id=$1', [id]);
    if (rowCount !== 1)
    {
        return null;
    }
    else
    {
        return Group.from(rows[0]);
    }
}

export async function deleteFakeGroupById(client: Client | PoolClient, id: Group['id']): Promise<void>
{
    await client.query('START TRANSACTION');
    await client.query('DELETE FROM groups WHERE id=$1', [id]);
    await client.query('COMMIT');
}

export async function selectAccountsByGroup(client: Client | PoolClient, id: Group['id']): Promise<Account[]>
{
    const {rows} = await client.query(
            `SELECT *
             FROM accounts      a,
                  account_group ag
             WHERE a.username = ag.username
               AND ag.group_id = $1`,
        [id]);
    return rows.map(row => Account.from(row));
}

export async function insertAccountGroup(client: Client | PoolClient, username: Account['username'], groupId: Group['id']): Promise<void>
{
    await client.query('START TRANSACTION');
    await client.query(`INSERT INTO account_group (username, group_id)
                        VALUES
                            ($1, $2)`, [username, groupId]);
    await client.query('COMMIT');
}

export async function deleteAccountGroup(client: Client | PoolClient, username: Account['username'], groupId: Group['id']): Promise<void>
{
    await client.query('START TRANSACTION');
    await client.query('DELETE FROM account_group WHERE username=$1 AND group_id=$2', [username, groupId]);
    await client.query('COMMIT');
}

export async function selectAdminsByGroup(client: Client | PoolClient, id: Group['id']): Promise<Account[]>
{
    const {rows} = await client.query(
            `SELECT *
             FROM accounts    a,
                  admin_group ag
             WHERE a.username = ag.admin_username
               AND ag.group_id = $1`,
        [id]);
    return rows.map(row => Account.from(row));
}

export async function insertAdminGroup(client: Client | PoolClient, adminUsername: Account['username'], groupId: Group['id']): Promise<void>
{
    await client.query('START TRANSACTION');
    await client.query(
        'INSERT INTO admin_group (admin_username, group_id) VALUES ($1, $2)',
        [adminUsername, groupId]);
    await client.query('COMMIT');
}

export async function deleteAdminGroup(client: Client | PoolClient, adminUsername: Account['username'], groupId: Group['id']): Promise<void>
{
    await client.query('START TRANSACTION');
    await client.query(
        'DELETE FROM admin_group WHERE admin_username=$1 AND group_id=$2',
        [adminUsername, groupId]);
    await client.query('COMMIT');
}

export async function selectRepositoriesByGroup(client: Client | PoolClient, id: Group['id']): Promise<Repository[]>
{
    const {rows} = await client.query(
            `SELECT *
             FROM repositories     r,
                  repository_group rg
             WHERE r.username = rg.repository_username
               AND r.name = rg.repository_name
               AND rg.group_id = $1`,
        [id]);
    return rows.map(row => Repository.from(row));
}

export async function insertRepositoryGroup(client: Client | PoolClient, repositoryUsername: Repository['username'], repositoryName: Repository['name'], groupId: Group['id']): Promise<void>
{
    await client.query('START TRANSACTION');
    await client.query(
        'INSERT INTO repository_group (repository_username, repository_name, group_id) VALUES ($1, $2, $3)',
        [repositoryUsername, repositoryName, groupId]);
    await client.query('COMMIT');
}

export async function deleteRepositoryGroup(client: Client | PoolClient, repositoryUsername: Repository['username'], repositoryName: Repository['name'], groupId: Group['id']): Promise<void>
{
    await client.query('START TRANSACTION');
    await client.query(
        'DELETE FROM repository_group WHERE repository_username=$1 AND repository_name=$2 AND group_id=$3',
        [repositoryUsername, repositoryName, groupId]);
    await client.query('COMMIT');
}

export async function insertFakeProfile(client: Client | PoolClient, profile: Profile)
{
    await client.query('START TRANSACTION');
    await client.query(
        'INSERT INTO profiles VALUES ($1,$2, $3, $4)',
        [profile.username, profile.nickname, profile.email, profile.avatar]);
    await client.query('COMMIT');
}

export async function selectFakeProfile(client: Client | PoolClient, username: Profile['username'])
{
    const {rows, rowCount} = await client.query(
        'SELECT * FROM profiles WHERE username=$1',
        [username]);
    if (rowCount === 1)
    {
        return Profile.from(rows[0]);
    }
    else
    {
        return null;
    }
}

export async function deleteFakeProfile(client: Client | PoolClient, username: Profile['username'])
{
    await client.query('START TRANSACTION');
    await client.query(
        'DELETE FROM profiles WHERE username=$1',
        [username]);
    await client.query('COMMIT');
}

export async function selectFakeRepository(client: Client | PoolClient, repository: Repository): Promise<Repository | null>
{
    const {rowCount, rows} = await client.query(
        'SELECT * FROM repositories WHERE username=$1 AND name=$2',
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
    await client.query('START TRANSACTION');
    await client.query(
        'INSERT INTO repositories (username, name, description, "isPublic") VALUES ($1,$2,$3,$4)',
        [repository.username, repository.name, repository.description, repository.isPublic]);
    await client.query('COMMIT');
}

export async function deleteFakeRepository(client: Client | PoolClient, repository: Repository)
{
    await client.query('START TRANSACTION');
    await client.query(
        'DELETE FROM repositories WHERE username=$1 AND name=$2',
        [repository.username, repository.name]);
    await client.query('COMMIT');
}