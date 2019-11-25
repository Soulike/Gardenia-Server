import {ServiceResponse} from '../ServiceResponse';
import faker from 'faker';

describe(`${ServiceResponse.name}`, () =>
{
    const statusCode = faker.random.number({min: 100, max: 599});
    const headers = {[faker.random.word()]: faker.random.word()};
    const session = {[faker.random.word()]: faker.random.word()};
    const body = {[faker.random.word()]: faker.random.word()};

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