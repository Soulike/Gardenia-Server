import {prefix} from '../../Function';

function pullRequestPrefix(url: string): string
{
    return prefix(`/pullRequest${url}`);
}

export const ADD = pullRequestPrefix('/add');
export const UPDATE = pullRequestPrefix('/update');
export const CLOSE = pullRequestPrefix('/close');
export const IS_MERGEABLE = pullRequestPrefix('/isMergeable');
export const MERGE = pullRequestPrefix('/merge');
export const GET = pullRequestPrefix('/get');
export const GET_BY_REPOSITORY = pullRequestPrefix('/getByRepository');
export const ADD_COMMENT = pullRequestPrefix('/addComment');
export const UPDATE_COMMENT = pullRequestPrefix('/updateComment');
export const GET_COMMENTS = pullRequestPrefix('/getComments');