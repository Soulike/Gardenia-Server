import Koa from 'koa';
import {dispatcher} from './Dispatcher';
import {GIT, SERVER, SESSION} from './CONFIG';
import signale from 'signale';
import {requestLogger} from './Middleware';
import {v2 as webdav} from 'webdav-server';
import session from 'koa-session';

const app = new Koa();
const server = new webdav.WebDAVServer({
    rootFileSystem: new webdav.PhysicalFileSystem(GIT.ROOT),
});

app.on('error', (e: Error) =>
{
    signale.error(`服务器未捕获的错误:\n${e.stack}`);
});
app.use(session(SESSION, app));
app.use(requestLogger());
app.use(dispatcher(app));
app.listen(SERVER.PORT, () =>
{
    server.start(GIT.WEBDAV_PORT);
    signale.info(`WebDAV 服务器运行在端口 ${GIT.WEBDAV_PORT}，服务器运行在端口 ${SERVER.PORT} (PID: ${process.pid})`);
});