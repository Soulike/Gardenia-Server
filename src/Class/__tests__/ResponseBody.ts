import {ResponseBody} from '../ResponseBody';

describe(`${ResponseBody.name}`, () =>
{
    const isSuccessful = true;
    const message = 'vbiagbiuae';
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