import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {ADD, ADD_COMMENT, CLOSE, GET, GET_AMOUNT_BY_REPOSITORY, GET_BY_REPOSITORY, GET_COMMENTS, REOPEN} from './ROUTE';
import bodyParser from '../../Middleware/bodyParser';
import {add, addComment, close, get, getAmountByRepository, getByRepository, getComments, reopen} from './Middleware';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import sessionChecker from '../../Middleware/sessionChecker';
import * as ParameterValidator from './ParameterValidator';

export default (router: Router<IState, IContext>) =>
{
    router
        .post(ADD, sessionChecker(), bodyParser(), ParameterValidator.add(), add())
        .post(CLOSE, sessionChecker(), bodyParser(), ParameterValidator.close(), close())
        .post(REOPEN, sessionChecker(), bodyParser(), ParameterValidator.reopen(), reopen())
        .get(GET_BY_REPOSITORY, JSONQuerystringParser(), ParameterValidator.getByRepository(), getByRepository())
        .get(GET_AMOUNT_BY_REPOSITORY, JSONQuerystringParser(), ParameterValidator.getAmountByRepository(), getAmountByRepository())
        .get(GET, JSONQuerystringParser(), ParameterValidator.get(), get())
        .get(GET_COMMENTS, JSONQuerystringParser(), ParameterValidator.getComments(), getComments())
        .post(ADD_COMMENT, sessionChecker(), bodyParser(), ParameterValidator.addComment(), addComment());
}