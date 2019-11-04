import {Account as AccountClass, Group, Profile as ProfileClass} from '../../Class';
import pool from '../Pool';
import {executeTransaction} from '../Function';

export async function selectByUsername(username: AccountClass['username']): Promise<AccountClass | null>
{
    const {rows, rowCount} = await pool.query(
            `SELECT *
             FROM accounts
             WHERE "username" = $1`,
        [username]);
    if (rowCount === 0)
    {
        return null;
    }
    else
    {
        return AccountClass.from(rows[0]);
    }
}

export async function update(account: Readonly<AccountClass>, primaryKey: Readonly<Pick<AccountClass, 'username'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await client.query(
                    `UPDATE accounts
                     SET "username"=$1,
                         "hash"=$2
                     WHERE "username" = $3`,
                [account.username, account.hash, primaryKey.username]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function insert(account: Readonly<AccountClass>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await client.query(
                    `INSERT INTO accounts("username", "hash")
                     VALUES
                         ($1, $2)`,
                [account.username, account.hash]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function deleteByUsername(username: AccountClass['username']): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await client.query(
                    `DELETE
                     FROM accounts
                     WHERE "username" = $1`,
                [username]);
        });
    }
    finally
    {
        client.release();
    }
}

/**
 * @description 为注册操作编写的接口，可以在一个事务内完成账号和账号资料的创建
 * */
export async function create(account: Readonly<AccountClass>, profile: Readonly<ProfileClass>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async (client) =>
        {
            await client.query(
                    `INSERT INTO accounts("username", "hash")
                     VALUES
                         ($1, $2)`,
                [account.username, account.hash]);
            await client.query(
                    `INSERT INTO profiles("username", "nickname", "email", "avatar")
                     VALUES
                         ($1, $2, $3, $4)`,
                [profile.username, profile.nickname, profile.email, profile.avatar]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function getGroupsByUsername(username: AccountClass['username']): Promise<Group[]>
{
    const {rows} = await pool.query(`SELECT *
                                     FROM accounts      a,
                                          account_group ag,
                                          groups        g
                                     WHERE a.username = ag.username
                                       AND ag.group_id = g.id
                                       AND a.username = $1`,
        [username]);
    return rows.map(row => Group.from(row));
}

export async function getAdministratingGroupsByUsername(username: AccountClass['username']): Promise<Group[]>
{
    const {rows} = await pool.query(`SELECT *
                                     FROM accounts    a,
                                          admin_group ag,
                                          groups      g
                                     WHERE a.username = ag.admin_username
                                       AND ag.group_id = g.id
                                       AND a.username = $1`,
        [username]);
    return rows.map(row => Group.from(row));
}

export async function getGroupByUsernameAndGroupName(username: AccountClass['username'], groupName: Group['name']): Promise<Group | null>
{
    const {rows, rowCount} = await pool.query(`SELECT *
                                               FROM accounts      a,
                                                    account_group ag,
                                                    groups        g
                                               WHERE a.username = ag.username
                                                 AND ag.group_id = g.id
                                                 AND a.username = $1
                                                 AND g.name = $2`,
        [username, groupName]);
    if (rowCount !== 1)
    {
        return null;
    }
    else
    {
        return Group.from(rows[0]);
    }
}

export async function getAdministratingGroupByUsernameAndGroupName(username: AccountClass['username'], groupName: Group['name']): Promise<Group | null>
{
    const {rows, rowCount} = await pool.query(`SELECT *
                                               FROM accounts    a,
                                                    admin_group ag,
                                                    groups      g
                                               WHERE a.username = ag.admin_username
                                                 AND ag.group_id = g.id
                                                 AND a.username = $1
                                                 AND g.name = $2`,
        [username, groupName]);
    if (rowCount !== 1)
    {
        return null;
    }
    else
    {
        return Group.from(rows[0]);
    }
}

export async function getAdministratingGroupByUsernameAndGroupId(username: AccountClass['username'], groupId: Group['id']): Promise<Group | null>
{
    const {rows, rowCount} = await pool.query(`SELECT *
                                               FROM accounts    a,
                                                    admin_group ag,
                                                    groups      g
                                               WHERE a.username = ag.admin_username
                                                 AND ag.group_id = g.id
                                                 AND a.username = $1
                                                 AND g.id = $2`,
        [username, groupId]);
    if (rowCount !== 1)
    {
        return null;
    }
    else
    {
        return Group.from(rows[0]);
    }
}