import {PoolConfig} from 'pg';

export const DATABASE: Readonly<PoolConfig> = Object.freeze({
    user: '',
    database: '',
    password: '',
    keepAlive: true,
    max: 64,
});
