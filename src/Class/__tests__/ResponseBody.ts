import {ResponseBody} from '../ResponseBody';
import faker from 'faker';

describe(`${ResponseBody.name}`, () =>
{
    const isSuccessful = faker.random.boolean();
    const message = faker.lorem.sentence();
    const data = {key: 'value'};

    it(`should construct ${ResponseBody.name} object`, function ()
    {
        expect(new ResponseBody(isSuccessful, message, data))
            .toEqual({
                isSuccessful,
                message,
                data,
            } as ResponseBody<typeof data>);
    });
});