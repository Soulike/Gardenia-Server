import {prefix} from '../../Function';

function repositoryPrefix(url: string): string
{
    return prefix(`/repository${url}`);
}

export const CREATE = repositoryPrefix('/create');
export const DEL = repositoryPrefix('/del');
export const GET_REPOSITORIES = repositoryPrefix('/getRepositories');