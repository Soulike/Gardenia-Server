import {ResponseBody} from './ResponseBody';
import {Readable} from 'stream';
import {Interface as DispatcherInterface} from '../Dispatcher';

/**
 * @class
 * @description 服务层处理业务完成后向分发层返回的对象
 * */
export class ServiceResponse<TBody>
{
    public readonly statusCode: number;
    public readonly headers: Readonly<{ [key: string]: string }>;
    public readonly session?: Readonly<DispatcherInterface.ISession>;
    public readonly body?: Readable | Readonly<ResponseBody<TBody>> | Readonly<TBody>;

    constructor(statusCode: number, headers: { [key: string]: string }, body?: Readable | Readonly<ResponseBody<TBody>> | Readonly<TBody>, session?: Readonly<DispatcherInterface.ISession>)
    {
        this.statusCode = statusCode;
        this.headers = Object.freeze(headers);
        this.session = Object.freeze(session);
        this.body = body instanceof Readable ? body : Object.freeze(body);
    }
}