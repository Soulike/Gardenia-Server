import {Client, PoolClient} from 'pg';
import {SERVER} from '../CONFIG';

/**
 * @description 对数据库事务的包装函数
 * @param client - pg 创建的 Client 实例。根据文档，此处不能是 Pool
 * @param transaction - 要执行的事务
 * */
export async function transaction<T extends Client | PoolClient>(client: T, transaction: (client: T) => Promise<any>)
{
    try
    {
        await client.query('START TRANSACTION');
        await transaction(client);    // 传入参数保证事务使用的是同一个 Client 实例
        await client.query('COMMIT');
    }
    catch (e)
    {
        SERVER.ERROR_LOGGER(e.stack);
        await client.query('ROLLBACK');
    }
}