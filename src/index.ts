import Koa from 'koa';
import dispatcher from './Dispatcher';
import {SERVER, SESSION, STARTUP_SCRIPT} from './CONFIG';
import signale from 'signale';
import session from 'koa-session';
import koa_static from 'koa-static';
import {execPromise} from './Function/Promisify';

Promise.all(STARTUP_SCRIPT.map(async command => execPromise(command)))
    .then(() => SERVER.INFO_LOGGER('启动脚本执行完成'))
    .catch(e => SERVER.ERROR_LOGGER(`执行启动脚本时发生错误\n${e}`));

const app = new Koa();

app.on('error', (e: Error) =>
{
    SERVER.ERROR_LOGGER(`未捕获的全局错误：\n${e.stack}`);
});
app.use(koa_static(SERVER.STATIC_FILE_PATH, {maxAge: 60 * 60 * 1000})); // 用于本地调试
app.use(session({...SESSION}, app));
app.use(dispatcher());

// 对外暴露 Server 方便测试
export default app.listen(SERVER.PORT, () =>
{
    signale.info(`服务器运行在端口 ${SERVER.PORT} (PID: ${process.pid})`);
});