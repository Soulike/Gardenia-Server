import Router from '@koa/router';
import {CHECK_PASSWORD, CHECK_SESSION, GET_ADMINISTRATING_GROUPS, GET_GROUPS, LOGIN, LOGOUT, REGISTER} from './ROUTE';
import POSTBodyParser from '../../Middleware/POSTBodyParser';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import {checkPassword, checkSession, getAdministratingGroups, getGroups, login, logout, register} from './Middleware';
import {IContext, IState} from '../../Interface';

export default (router: Router<IState, IContext>) =>
{
    router.post(LOGIN, POSTBodyParser(), login());
    router.post(REGISTER, POSTBodyParser(), register());
    router.get(CHECK_SESSION, checkSession());
    router.post(LOGOUT, logout());
    router.get(GET_GROUPS, JSONQueryParameterParser(), getGroups());
    router.get(GET_ADMINISTRATING_GROUPS, JSONQueryParameterParser(), getAdministratingGroups());
    router.get(CHECK_PASSWORD, JSONQueryParameterParser(), checkPassword());
};