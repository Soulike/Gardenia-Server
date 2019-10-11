import http, {Server} from 'http';
import {GIT} from '../CONFIG';

const cgi = require('cgi');

export class GitHTTPCgiServer
{
    // Singleton
    private static readonly cgiServer: Server = http.createServer(cgi('git http-backend', {
        env: {
            GIT_HTTP_EXPORT_ALL: '',
            GIT_PROJECT_ROOT: GIT.ROOT,
        },
        stderr: process.stderr,
        shell: true,
    })).listen();

    public static async getCgiServer(): Promise<Server>
    {
        if (!GitHTTPCgiServer.cgiServer.listening)
        {
            await GitHTTPCgiServer.waitForListeningEvent();
        }
        return GitHTTPCgiServer.cgiServer;
    }

    private static async waitForListeningEvent(): Promise<void>
    {
        return new Promise<void>(resolve =>
        {
            if (GitHTTPCgiServer.cgiServer.listening)
            {
                resolve();
            }
            else
            {
                GitHTTPCgiServer.cgiServer.on('listening', () =>
                {
                    resolve();
                });
            }
        });
    }
}