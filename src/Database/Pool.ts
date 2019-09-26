import {Pool} from 'pg';
import {SERVER} from '../CONFIG';

const pool = new Pool({
    user: '',
    database: '',
    password: '',
    keepAlive: true,
    max: 64,
});

pool.connect()
    .catch(e =>
    {
        SERVER.ERROR_LOGGER(e.stack);
        process.exit(-1);   // 数据库连接失败，立即退出
    });

export default pool;