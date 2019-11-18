import {ResponseBody} from './ResponseBody';
import {Readable} from 'stream';

/**
 * @class
 * @description 服务层处理业务完成后向分发层返回的对象
 * */
export class ServiceResponse<TBody = void>
{
    public readonly statusCode: number;
    public readonly headers?: Readonly<{ [key: string]: string }>;
    public readonly session?: Readonly<{ [key: string]: string | undefined }>;
    public readonly body?: Readonly<ResponseBody<TBody>> | Readable;

    constructor(statusCode: number, headers?: { [key: string]: string }, body?: ResponseBody<TBody> | Readable, session?: { [key: string]: string | undefined })
    {
        this.statusCode = statusCode;
        this.headers = Object.freeze(headers);
        this.session = Object.freeze(session);
        this.body = body instanceof Readable ? body : Object.freeze(body);
    }
}