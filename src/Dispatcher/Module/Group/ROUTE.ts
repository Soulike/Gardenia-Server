import {prefix} from '../../Function';

function groupPrefix(url: string): string
{
    return prefix(`/group${url}`);
}

export const INFO = groupPrefix('/info');
export const ACCOUNTS = groupPrefix('/accounts');