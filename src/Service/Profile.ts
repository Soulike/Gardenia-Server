import {Profile as ProfileClass, ResponseBody, ServiceResponse} from '../Class';
import {Profile as ProfileTable} from '../Database';

export async function get(username: string): Promise<ServiceResponse<ProfileClass | void>>
{
    const profile = await ProfileTable.selectByUsername(username);
    if (profile === null)
    {
        return new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '用户不存在'));
    }

    return new ServiceResponse<ProfileClass>(200, {},
        new ResponseBody<ProfileClass>(true, '', profile));
}