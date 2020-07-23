import {stores} from 'koa-session';
import redis from './Redis';

export const get: stores['get'] = async (key, maxAge, data) =>
{
    const valInStore = await redis.get(key);
    if (valInStore === null)
    {
        return null;
    }
    const val = JSON.parse(valInStore);
    const {rolling} = data;
    if (rolling === true)
    {
        await set(key, val, maxAge, {changed: false, rolling});
    }
    return val;
};

export const set: stores['set'] = async (key, sess, maxAge) =>
{
    let realMaxAge: number; // 毫秒
    if (typeof maxAge === 'number')
    {
        realMaxAge = maxAge;
    }
    else
    {
        realMaxAge = 24 * 60 * 60 * 1000;
    }
    await redis.set(key, JSON.stringify(sess), 'PX', realMaxAge);
};

export const destroy: stores['destroy'] = async key =>
{
    await redis.del(key);
};