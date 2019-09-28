export namespace Util
{
    export function parseJSONFromQuery(json: any): any
    {
        if (typeof json !== 'string')
        {
            throw new TypeError();
        }

        return JSON.parse(json);
    }
}