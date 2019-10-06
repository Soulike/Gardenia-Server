import Koa from 'koa';
import dispatcher from './Dispatcher';
import {SERVER, SESSION} from './CONFIG';
import signale from 'signale';
import session from 'koa-session';

const app = new Koa();

app.on('error', (e: Error) =>
{
    signale.error(`服务器未捕获的错误:\n${e.stack}`);
});
app.use(session(SESSION, app));
app.use(dispatcher(app));
app.listen(SERVER.PORT, () =>
{
    signale.info(`服务器运行在端口 ${SERVER.PORT} (PID: ${process.pid})`);
});
