/**
 * 该文件存储后端所能接受的数字的范围
 * */

export const GROUP_ID = Object.freeze({
    MIN: 1,
    MAX: Number.MAX_SAFE_INTEGER,
});

export const PULL_REQUEST_ID = GROUP_ID;
export const PULL_REQUEST_NO = GROUP_ID;
export const PULL_REQUEST_COMMENT_ID = GROUP_ID;

export const ISSUE_ID = GROUP_ID;
export const ISSUE_NO = GROUP_ID;
export const ISSUE_COMMENT_ID = GROUP_ID;

export const CODE_COMMENT_ID = GROUP_ID;
export const CODE_COMMENT_LINE_NUMBER = GROUP_ID;