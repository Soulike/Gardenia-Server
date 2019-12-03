import {ServiceResponse} from '../ServiceResponse';

describe(`${ServiceResponse.name}`, () =>
{
    const statusCode = 404;
    const headers = {a: 'b', b: 'e'};
    const session = {username: 'afaegae'};
    const body = {aaa: 'c', vv: 2, c: {s: 98}};

    it(`should construct ${ServiceResponse.name} object`, function ()
    {
        expect(new ServiceResponse(statusCode, headers, body, session))
            .toEqual({
                statusCode,
                headers,
                session,
                body,
            } as ServiceResponse<typeof body>);
    });
});