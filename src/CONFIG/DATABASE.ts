import {PoolConfig} from 'pg';

export const DATABASE: PoolConfig = {
    user: '',
    database: '',
    password: '',
    keepAlive: true,
    max: 64,
};
