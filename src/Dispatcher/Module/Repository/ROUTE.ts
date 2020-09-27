import {prefix} from '../../Function';

function repositoryPrefix(url: string): string
{
    return prefix(`/repository${url}`);
}

export const CREATE = repositoryPrefix('/create');
export const DEL = repositoryPrefix('/del');
export const GET_REPOSITORIES = repositoryPrefix('/getRepositories');
export const FORK = repositoryPrefix('/fork');
export const IS_MERGEABLE = repositoryPrefix('/isMergeable');
export const SEARCH = repositoryPrefix('/search');
export const SHOULD_SHOW_OPTIONS = repositoryPrefix('/shouldShowOptions');