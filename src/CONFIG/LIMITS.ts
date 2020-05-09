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

// 一次请求能获取信息的最多条数
export const COMMIT = 50;
export const DIFF = 50;
export const REPOSITORIES = 100;
export const PULL_REQUESTS = 100;
export const PULL_REQUEST_COMMENTS = 100;
export const ISSUES = 100;
export const ISSUE_COMMENTS = 100;