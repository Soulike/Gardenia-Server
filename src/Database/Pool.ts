import {Pool} from 'pg';
import {SERVER} from '../CONFIG';

const pool = new Pool({
    user: '',
    database: '',
    password: '',
    keepAlive: true,
    max: 64,
});

// 尝试进行连接
pool.connect()
    .then(client =>
    {
        return new Promise<void>(async (resolve, reject) =>
        {
            client.query('SELECT 1=1', e =>
            {
                if (e !== null)
                {
                    reject(e);
                }
                else
                {
                    SERVER.SUCCESS_LOGGER('数据库连接成功');
                    resolve();
                }
                client.release();
            });
        });
    })
    .catch(e =>
    {
        SERVER.ERROR_LOGGER(e.stack);
        process.exit(-1);   // 数据库连接失败，立即退出
    });

export default pool;