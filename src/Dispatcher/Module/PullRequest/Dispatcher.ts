import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {
    ADD,
    ADD_COMMENT,
    CLOSE,
    GET,
    GET_BY_REPOSITORY,
    GET_COMMENTS,
    IS_MERGEABLE,
    MERGE,
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
    isMergeable,
    merge,
    update,
    updateComment,
} from './Middleware';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';

export default (router: Router<IState, IContext>) =>
{
    router.post(ADD, bodyParser(), add())
        .post(UPDATE, bodyParser(), update())
        .post(CLOSE, bodyParser(), close())
        .get(IS_MERGEABLE, JSONQuerystringParser(), isMergeable())
        .post(MERGE, bodyParser(), merge())
        .get(GET, JSONQuerystringParser(), get())
        .get(GET_BY_REPOSITORY, JSONQuerystringParser(), getByRepository())
        .post(ADD_COMMENT, bodyParser(), addComment())
        .post(UPDATE_COMMENT, bodyParser(), updateComment())
        .get(GET_COMMENTS, JSONQuerystringParser(), getComments());
}