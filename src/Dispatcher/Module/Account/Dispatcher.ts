import Router from '@koa/router';
import {CHECK_PASSWORD, CHECK_SESSION, GET_ADMINISTRATING_GROUPS, GET_GROUPS, LOGIN, LOGOUT, REGISTER} from './ROUTE';
import bodyParser from '../../Middleware/bodyParser';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import {checkPassword, checkSession, getAdministratingGroups, getGroups, login, logout, register} from './Middleware';
import {IContext, IState} from '../../Interface';

export default (router: Router<IState, IContext>) =>
{
    router.post(LOGIN, bodyParser(), login());
    router.post(REGISTER, bodyParser(), register());
    router.get(CHECK_SESSION, checkSession());
    router.post(LOGOUT, logout());
    router.get(GET_GROUPS, JSONQuerystringParser(), getGroups());
    router.get(GET_ADMINISTRATING_GROUPS, JSONQuerystringParser(), getAdministratingGroups());
    router.post(CHECK_PASSWORD, bodyParser(), checkPassword());
};