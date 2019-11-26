import {Pool} from 'pg';
import {DATABASE, SERVER} from '../CONFIG';

const pool = new Pool(DATABASE);

// 尝试进行连接
pool.connect()
    .then(client =>
    {
        return new Promise<void>((resolve, reject) =>
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
        SERVER.ERROR_LOGGER('数据库连接失败');
        SERVER.ERROR_LOGGER(e);
        process.exit(-1);
    });

export default pool;