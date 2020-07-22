import {Repository} from '../../../Class';
import redis from './Redis';

export async function setCollaborateCodeToRepository(code: string, repository: Pick<Repository, 'username' | 'name'>): Promise<void>
{
    const result = await redis.set(code, JSON.stringify(repository), 'EX', 7 * 24 * 60 * 60); // 单位是秒
    if (result !== 'OK')
    {
        throw new Error('Redis 设置仓库合作邀请码失败');
    }
}

export async function getRepositoryFromCollaborateCode(code: string): Promise<Pick<Repository, 'username' | 'name'> | null>
{
    const result = await redis.get(code);
    if (result === null)
    {
        return null;
    }
    const {username, name} = JSON.parse(result);
    if (!Repository.validate(new Repository(username, name, '', true)))
    {
        return null;
    }
    return {username, name};
}

export async function deleteCollaborateCode(code: string): Promise<void>
{
    await redis.del(code);
}