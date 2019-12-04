import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {
    ACCOUNTS,
    ADD,
    ADD_ACCOUNTS,
    ADD_ADMINS,
    ADMINS,
    DISMISS,
    INFO,
    IS_ADMIN,
    REMOVE_ACCOUNTS,
    REMOVE_ADMINS,
    REMOVE_REPOSITORIES,
    REPOSITORIES,
} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import {
    accounts,
    add,
    addAccounts,
    addAdmins,
    admins,
    dismiss,
    info,
    isAdmin,
    removeAccounts,
    removeAdmins,
    removeRepositories,
    repositories,
} from './Middleware';
import bodyParser from '../../Middleware/bodyParser';

export default (router: Router<IState, IContext>) =>
{
    router.post(ADD, bodyParser(), add());
    router.post(DISMISS, bodyParser(), dismiss());
    router.get(INFO, JSONQuerystringParser(), info());
    router.get(ACCOUNTS, JSONQuerystringParser(), accounts());
    router.post(ADD_ACCOUNTS, bodyParser(), addAccounts());
    router.post(REMOVE_ACCOUNTS, bodyParser(), removeAccounts());
    router.get(ADMINS, JSONQuerystringParser(), admins());
    router.post(ADD_ADMINS, bodyParser(), addAdmins());
    router.post(REMOVE_ADMINS, bodyParser(), removeAdmins());
    router.get(REPOSITORIES, JSONQuerystringParser(), repositories());
    router.post(REMOVE_REPOSITORIES, bodyParser(), removeRepositories());
    router.get(IS_ADMIN, JSONQuerystringParser(), isAdmin());
};