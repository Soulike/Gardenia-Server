import Router from '@koa/router';
import proxy from 'koa-better-http-proxy';
import {GIT} from '../../CONFIG';
import http from 'http';
import {AddressInfo} from 'net';

const cgi = require('cgi');

export default (router: Router) =>
{
    router.all(/\/(.+)\/(.+)\.git.*/, async (ctx, next) =>
    {
        try
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
        }
        finally
        {
            // 什么都不做
        }
    });
}