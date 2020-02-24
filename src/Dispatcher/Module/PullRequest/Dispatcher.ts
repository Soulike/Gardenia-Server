import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {
    ADD,
    ADD_COMMENT,
    CLOSE,
    GET,
    GET_BY_REPOSITORY,
    GET_COMMENTS,
    GET_OPEN_PULL_REQUEST_AMOUNT,
    IS_MERGEABLE,
    MERGE,
    REOPEN,
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
    getOpenPullRequestAmount,
    isMergeable,
    merge,
    reopen,
    update,
    updateComment,
} from './Middleware';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';

export default (router: Router<IState, IContext>) =>
{
    router.post(ADD, bodyParser(), add())
        .post(UPDATE, bodyParser(), update())
        .post(CLOSE, bodyParser(), close())
        .post(REOPEN, bodyParser(), reopen())
        .get(IS_MERGEABLE, JSONQuerystringParser(), isMergeable())
        .post(MERGE, bodyParser(), merge())
        .get(GET, JSONQuerystringParser(), get())
        .get(GET_BY_REPOSITORY, JSONQuerystringParser(), getByRepository())
        .get(GET_OPEN_PULL_REQUEST_AMOUNT, JSONQuerystringParser(), getOpenPullRequestAmount())
        .post(ADD_COMMENT, bodyParser(), addComment())
        .post(UPDATE_COMMENT, bodyParser(), updateComment())
        .get(GET_COMMENTS, JSONQuerystringParser(), getComments());
}