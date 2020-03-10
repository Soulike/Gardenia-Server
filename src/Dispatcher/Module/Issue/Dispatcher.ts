import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {ADD, ADD_COMMENT, CLOSE, GET, GET_AMOUNT_BY_REPOSITORY, GET_BY_REPOSITORY, GET_COMMENTS, REOPEN} from './ROUTE';
import bodyParser from '../../Middleware/bodyParser';
import {add, addComment, close, get, getAmountByRepository, getByRepository, getComments, reopen} from './Middleware';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';

export default (router: Router<IState, IContext>) =>
{
    router
        .post(ADD, bodyParser(), add())
        .post(CLOSE, bodyParser(), close())
        .post(REOPEN, bodyParser(), reopen())
        .get(GET_BY_REPOSITORY, JSONQuerystringParser(), getByRepository())
        .get(GET_AMOUNT_BY_REPOSITORY, JSONQuerystringParser(), getAmountByRepository())
        .get(GET, JSONQuerystringParser(), get())
        .get(GET_COMMENTS, JSONQuerystringParser(), getComments())
        .post(ADD_COMMENT, bodyParser(), addComment());
}