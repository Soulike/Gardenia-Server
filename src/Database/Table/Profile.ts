import {executeTransaction} from '../Function';
import pool from '../Pool';
import {Profile as ProfileClass} from '../../Class';
import validator from 'validator';
import {strict as assert} from 'assert';

export const insertStatement = 'INSERT INTO profiles("username", "nickname", "email", "avatar") VALUES ($1, $2, $3, $4)';
export const delStatement = 'DELETE FROM profiles WHERE "username"=$1';
export const updateStatement = 'UPDATE profiles SET "username"=$1, "nickname"=$2, "email"=$3, "avatar"=$4 WHERE "username"=$1';
export const selectStatement = 'SELECT * FROM profiles WHERE "username"=$1';

export async function insert(profile: ProfileClass): Promise<void>
{
    assert.ok(validator.isEmail(profile.email), 'Property "email" of a profile should be an email address');
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            await client.query(insertStatement, [profile.username, profile.nickname, profile.email, profile.avatar]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function del(username: ProfileClass['username']): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            await client.query(delStatement, [username]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function update(profile: ProfileClass): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            assert.ok(validator.isEmail(profile.email), 'Property "email" of a profile should be an email address');
            await client.query(updateStatement, [profile.username, profile.nickname, profile.email, profile.avatar]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function select(username: ProfileClass['username']): Promise<ProfileClass | null>
{
    const {rows, rowCount} = await pool.query(selectStatement, [username]);
    if (rowCount === 0)
    {
        return null;
    }
    else
    {
        return ProfileClass.from(rows[0]);
    }
}