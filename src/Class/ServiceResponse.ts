import {ResponseBody} from './ResponseBody';

/**
 * @class
 * @description 在不需要操纵原始请求与响应对象时，服务层处理业务完成后向分发层返回的对象
 * */
export class ServiceResponse<TBody>
{
    public statusCode: number;
    public headers?: { [key: string]: string };

    public body?: ResponseBody<TBody>;

    /**
     * @constructor
     * @param statusCode - HTTP 响应代码
     * @param headers - 添加的 HTTP 响应头
     * @param body - 响应体
     * */
    constructor(statusCode: number, headers?: { [p: string]: string }, body?: ResponseBody<TBody>)
    {
        this.statusCode = statusCode;
        this.headers = headers;
        this.body = body;
    }
}