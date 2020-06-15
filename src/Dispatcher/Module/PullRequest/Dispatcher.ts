import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {
    ADD,
    ADD_COMMENT,
    CLOSE,
    GET,
    GET_BY_REPOSITORY,
    GET_COMMENTS,
    GET_COMMIT_AMOUNT,
    GET_COMMITS,
    GET_CONFLICTS,
    GET_FILE_DIFF_AMOUNT,
    GET_FILE_DIFFS,
    GET_PULL_REQUEST_AMOUNT,
    IS_MERGEABLE,
    MERGE,
    REOPEN,
    RESOLVE_CONFLICTS,
    UPDATE,
    UPDATE_COMMENT,
} from './ROUTE';
import bodyParser from '../../Middleware/bodyParser';
import {
    add,
    addComment,
    close,
    get,
    getByRepository,
    getComments,
    getCommitAmount,
    getCommits,
    getConflicts,
    getFileDiffAmount,
    getFileDiffs,
    getPullRequestAmount,
    isMergeable,
    merge,
    reopen,
    resolveConflicts,
    update,
    updateComment,
} from './Middleware';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import sessionChecker from '../../Middleware/sessionChecker';

export default (router: Router<IState, IContext>) =>
{
    router.post(ADD, sessionChecker(), bodyParser(), add())
        .post(UPDATE, sessionChecker(), bodyParser(), update())
        .post(CLOSE, sessionChecker(), bodyParser(), close())
        .post(REOPEN, sessionChecker(), bodyParser(), reopen())
        .get(IS_MERGEABLE, JSONQuerystringParser(), isMergeable())
        .post(MERGE, sessionChecker(), bodyParser(), merge())
        .get(GET, JSONQuerystringParser(), get())
        .get(GET_BY_REPOSITORY, JSONQuerystringParser(), getByRepository())
        .get(GET_PULL_REQUEST_AMOUNT, JSONQuerystringParser(), getPullRequestAmount())
        .post(ADD_COMMENT, sessionChecker(), bodyParser(), addComment())
        .post(UPDATE_COMMENT, sessionChecker(), bodyParser(), updateComment())
        .get(GET_COMMENTS, JSONQuerystringParser(), getComments())
        .get(GET_CONFLICTS, JSONQuerystringParser(), getConflicts())
        .post(RESOLVE_CONFLICTS, sessionChecker(), bodyParser(), resolveConflicts())
        .get(GET_COMMITS, JSONQuerystringParser(), getCommits())
        .get(GET_COMMIT_AMOUNT, JSONQuerystringParser(), getCommitAmount())
        .get(GET_FILE_DIFFS, JSONQuerystringParser(), getFileDiffs())
        .get(GET_FILE_DIFF_AMOUNT, JSONQuerystringParser(), getFileDiffAmount());
}