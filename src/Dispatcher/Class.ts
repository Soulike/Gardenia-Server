import {ResponseBody, ServiceResponse} from '../Class';

export class WrongParameterError extends ServiceResponse<void>
{
    constructor()
    {
        super(400, {}, new ResponseBody(false, '请求参数错误'));
    }
}

export class InvalidSessionError extends ServiceResponse<void>
{
    constructor()
    {
        super(400, {}, new ResponseBody(false, '未登录操作'));
    }
}