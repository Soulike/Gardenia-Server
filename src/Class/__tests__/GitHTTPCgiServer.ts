import {GitHTTPCgiServer} from '../GitHTTPCgiServer';

describe(GitHTTPCgiServer, () =>
{
    it('should always get the same cgi server instance', async function ()
    {
        expect(await GitHTTPCgiServer.getCgiServer())
            .toBe(await GitHTTPCgiServer.getCgiServer());
    });

    it('should get a listening cgi server', async function ()
    {
        const server = await GitHTTPCgiServer.getCgiServer();
        expect(server.listening).toBe(true);
    });
});