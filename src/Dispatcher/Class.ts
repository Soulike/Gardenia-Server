import {ResponseBody, ServiceResponse} from '../Class';

export class WrongParameterError extends ServiceResponse<string>
{
    constructor()
    {
        super(400, {}, new ResponseBody<string>(false, '请求参数错误'));
    }
}