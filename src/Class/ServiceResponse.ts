import {ResponseBody} from './ResponseBody';

/**
 * @class
 * @description 在不需要操纵原始请求与响应对象时，服务层处理业务完成后向分发层返回的对象
 * */
export class ServiceResponse<TBody>
{
    public readonly statusCode: number;
    public readonly headers?: Readonly<{ [key: string]: string }>;
    public readonly session?: Readonly<{ [key: string]: string | undefined }>;
    public readonly body?: Readonly<ResponseBody<TBody>>;

    /**
     * @constructor
     * @param statusCode - HTTP 响应代码
     * @param headers - 添加的 HTTP 响应头
     * @param body - 响应体
     * @param session - 会话对象
     * */

    constructor(statusCode: number, headers?: { [key: string]: string }, body?: ResponseBody<TBody>, session?: { [key: string]: string | undefined })
    {
        this.statusCode = statusCode;
        this.headers = Object.freeze(headers);
        this.session = Object.freeze(session);
        this.body = Object.freeze(body);
    }
}