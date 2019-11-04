import {executeTransaction} from '../Function';
import pool from '../Pool';
import {Profile as ProfileClass} from '../../Class';
import validator from 'validator';
import {strict as assert} from 'assert';

export async function update(profile: Readonly<ProfileClass>, primaryKey: Readonly<Pick<ProfileClass, 'username'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            assert.ok(validator.isEmail(profile.email), 'Property "email" of a profile should be an email address');
            await client.query(
                    `UPDATE profiles
                     SET "username"=$1,
                         "nickname"=$2,
                         "email"=$3,
                         "avatar"=$4
                     WHERE "username" = $5`,
                [profile.username, profile.nickname, profile.email, profile.avatar, primaryKey.username]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function selectByUsername(username: ProfileClass['username']): Promise<ProfileClass | null>
{
    const {rows, rowCount} = await pool.query(
            `SELECT *
             FROM profiles
             WHERE "username" = $1`,
        [username]);
    if (rowCount === 0)
    {
        return null;
    }
    else
    {
        return ProfileClass.from(rows[0]);
    }
}