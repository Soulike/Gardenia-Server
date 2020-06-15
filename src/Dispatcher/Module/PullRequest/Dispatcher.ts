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
import * as ParameterValidator from './PatameterValidator';

export default (router: Router<IState, IContext>) =>
{
    router.post(ADD, sessionChecker(), bodyParser(), ParameterValidator.add(), add())
        .post(UPDATE, sessionChecker(), bodyParser(), ParameterValidator.update(), update())
        .post(CLOSE, sessionChecker(), bodyParser(), ParameterValidator.close(), close())
        .post(REOPEN, sessionChecker(), bodyParser(), ParameterValidator.reopen(), reopen())
        .get(IS_MERGEABLE, JSONQuerystringParser(), ParameterValidator.isMergeable(), isMergeable())
        .post(MERGE, sessionChecker(), bodyParser(), ParameterValidator.merge(), merge())
        .get(GET, JSONQuerystringParser(), ParameterValidator.get(), get())
        .get(GET_BY_REPOSITORY, JSONQuerystringParser(), ParameterValidator.getByRepository(), getByRepository())
        .get(GET_PULL_REQUEST_AMOUNT, JSONQuerystringParser(), ParameterValidator.getPullRequestAmount(), getPullRequestAmount())
        .post(ADD_COMMENT, sessionChecker(), bodyParser(), ParameterValidator.addComment(), addComment())
        .post(UPDATE_COMMENT, sessionChecker(), bodyParser(), ParameterValidator.updateComment(), updateComment())
        .get(GET_COMMENTS, JSONQuerystringParser(), ParameterValidator.getComments(), getComments())
        .get(GET_CONFLICTS, JSONQuerystringParser(), ParameterValidator.getConflicts(), getConflicts())
        .post(RESOLVE_CONFLICTS, sessionChecker(), bodyParser(), ParameterValidator.resolveConflicts(), resolveConflicts())
        .get(GET_COMMITS, JSONQuerystringParser(), ParameterValidator.getCommits(), getCommits())
        .get(GET_COMMIT_AMOUNT, JSONQuerystringParser(), ParameterValidator.getCommitAmount(), getCommitAmount())
        .get(GET_FILE_DIFFS, JSONQuerystringParser(), ParameterValidator.getFileDiffs(), getFileDiffs())
        .get(GET_FILE_DIFF_AMOUNT, JSONQuerystringParser(), ParameterValidator.getFileDiffAmount(), getFileDiffAmount());
}