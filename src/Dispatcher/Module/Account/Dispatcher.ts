import Router from '@koa/router';
import {CHECK_SESSION, LOGIN, LOGOUT, REGISTER} from './ROUTE';
import POSTBodyParser from '../../Middleware/POSTBodyParser';
import {checkSession, login, logout, register} from './Middleware';

export default (router: Router) =>
{
    router.post(LOGIN, POSTBodyParser(), login());
    router.post(REGISTER, POSTBodyParser(), register());
    router.get(CHECK_SESSION, checkSession());
    router.post(LOGOUT, logout());
};