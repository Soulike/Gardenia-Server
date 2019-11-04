import {Account, Group, Repository} from '../../Class';
import pool from '../Pool';
import {executeTransaction} from '../Function';

export async function insertAndReturnId(group: Readonly<Omit<Group, 'id'>>): Promise<Group['id']>
{
    const client = await pool.connect();
    try
    {
        const queryResult = await executeTransaction(client, async (client) =>
        {
            return await client.query(
                    `INSERT INTO "groups" ("name")
                     VALUES
                         ($1)
                     RETURNING "id"`,
                [group.name]);
        });
        const {rows} = queryResult;
        return Number.parseInt(rows[0]['id']);
    }
    finally
    {
        client.release();
    }
}

export async function deleteById(id: Group['id']): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await client.query(
                    `DELETE
                     FROM "groups"
                     WHERE "id" = $1`,
                [id]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function update(group: Readonly<Group>, primaryKey: Readonly<Pick<Group, 'id'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await client.query(
                    `UPDATE "groups"
                     SET "id"=$1,
                         "name"=$2
                     WHERE "id" = $3`,
                [group.id, group.name, primaryKey.id]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function selectById(id: Group['id']): Promise<Group | null>
{
    const {rows, rowCount} = await pool.query(
            `SELECT *
             FROM "groups"
             WHERE "id" = $1`,
        [id]);
    if (rowCount === 1)
    {
        return Group.from(rows[0]);
    }
    else
    {
        return null;
    }
}

export async function getAccountsById(id: Group['id']): Promise<Account[]>
{
    const {rows} = await pool.query(
            `SELECT *
             FROM groups        g,
                  account_group ag,
                  accounts      a
             WHERE g.id = ag.group_id
               AND a.username = ag.username
               AND g.id = $1`,
        [id]);

    return rows.map(row => Account.from(row));
}

export async function addAccounts(id: Group['id'], usernames: Readonly<Account['username'][]>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await Promise.all(usernames.map(username => client.query(
                    `INSERT INTO account_group (username, group_id)
                     VALUES
                         ($1, $2)`,
                [username, id])));
        });
    }
    finally
    {
        client.release();
    }
}

export async function removeAccounts(id: Group['id'], usernames: Readonly<Account['username'][]>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await Promise.all(usernames.map(username => client.query(
                    `DELETE
                     FROM account_group
                     WHERE group_id = $1
                       AND username = $2`,
                [id, username])));
        });
    }
    finally
    {
        client.release();
    }
}

export async function getAdminsById(id: Group['id']): Promise<Account[]>
{
    const {rows} = await pool.query(
            `SELECT *
             FROM groups      g,
                  admin_group ag,
                  accounts    a
             WHERE g.id = ag.group_id
               AND a.username = ag.admin_username
               AND g.id = $1`,
        [id]);

    return rows.map(row => Account.from(row));
}

export async function addAdmins(id: Group['id'], usernames: Readonly<Account['username'][]>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await Promise.all(usernames.map(username => client.query(
                    `INSERT INTO admin_group (admin_username, group_id)
                     VALUES
                         ($1, $2)`,
                [username, id])));
        });
    }
    finally
    {
        client.release();
    }
}

export async function removeAdmins(id: Group['id'], usernames: Readonly<Account['username'][]>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await Promise.all(usernames.map(username => client.query(
                    `DELETE
                     FROM admin_group
                     WHERE group_id = $1
                       AND admin_username = $2`,
                [id, username])));
        });
    }
    finally
    {
        client.release();
    }
}

export async function getRepositoriesById(id: Group['id']): Promise<Repository[]>
{
    const {rows} = await pool.query(
            `SELECT *
             FROM groups           g,
                  repository_group rg,
                  repositories     r
             WHERE g.id = rg.group_id
               AND r.username = rg.repository_username
               AND r.name = rg.repository_name
               AND g.id = $1`,
        [id]);

    return rows.map(row => Repository.from(row));
}

export async function addRepositories(id: Group['id'], repositories: Readonly<Readonly<Pick<Repository, 'username' | 'name'>>[]>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await Promise.all(repositories.map(({username, name}) => client.query(
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

export async function removeRepositories(id: Group['id'], repositories: Readonly<Readonly<Pick<Repository, 'username' | 'name'>>[]>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await Promise.all(repositories.map(({username, name}) => client.query(
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