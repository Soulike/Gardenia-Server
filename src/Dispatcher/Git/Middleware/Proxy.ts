import {Middleware} from 'koa';
import http from 'http';
import {GIT} from '../../../CONFIG';
import {AddressInfo} from 'net';
import proxy from 'koa-better-http-proxy';

const cgi = require('cgi');

export default (): Middleware =>
{
    return async (ctx, next) =>
    {
        // 开启一个临时的 CGI 服务器处理请求
        const server = http.createServer(cgi('git http-backend', {
            env: {
                GIT_HTTP_EXPORT_ALL: '',
                GIT_PROJECT_ROOT: GIT.ROOT,
            },
            stderr: process.stderr,
            shell: true,
        })).listen();
        const port = (server.address() as AddressInfo).port;
        await proxy(`localhost`, {
            port,
            preserveHostHdr: true,
            preserveReqSession: true,
            parseReqBody: false,
        })(ctx, next);
        server.close(); // 请求处理完成立即关闭
    };
}