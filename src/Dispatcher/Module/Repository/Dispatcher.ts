import Router from '@koa/router';
import {CREATE, DEL, GET_REPOSITORIES} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import {create, del, getRepositories} from './Middleware';
import bodyParser from '../../Middleware/bodyParser';
import {IContext, IState} from '../../Interface';

export default (router: Router<IState, IContext>) =>
{
    router.post(CREATE, bodyParser(), create());
    router.post(DEL, bodyParser(), del());
    router.get(GET_REPOSITORIES, JSONQuerystringParser(), getRepositories());
};