import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {ADD, DEL, GET, UPDATE} from './ROUTE';
import bodyParser from '../../Middleware/bodyParser';
import {add, del, get, update} from './Middleware';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';

export default (router: Router<IState, IContext>) =>
{
    router
        .post(ADD, bodyParser(), add())
        .post(DEL, bodyParser(), del())
        .get(GET, JSONQuerystringParser(), get())
        .post(UPDATE, bodyParser(), update());
}