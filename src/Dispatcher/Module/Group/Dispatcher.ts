import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {
    ACCOUNTS,
    ADD,
    ADD_ACCOUNT,
    ADD_ACCOUNTS,
    ADD_ADMIN,
    ADD_ADMINS,
    ADD_REPOSITORY,
    ADMINS,
    CHANGE_NAME,
    DISMISS,
    GET_ADMINISTRATING_BY_ACCOUNT,
    GET_BY_ACCOUNT,
    GET_BY_REPOSITORY,
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
    addAccount,
    addAccounts,
    addAdmin,
    addAdmins,
    addRepository,
    admins,
    changeName,
    dismiss,
    getAdministratingByAccount,
    getByAccount,
    getByRepository,
    info,
    isAdmin,
    removeAccounts,
    removeAdmins,
    removeRepositories,
    repositories,
} from './Middleware';
import bodyParser from '../../Middleware/bodyParser';
import sessionChecker from '../../Middleware/sessionChecker';

export default (router: Router<IState, IContext>) =>
{
    router
        .post(ADD, sessionChecker(), bodyParser(), add())
        .post(DISMISS, sessionChecker(), bodyParser(), dismiss())
        .get(INFO, JSONQuerystringParser(), info())
        .post(CHANGE_NAME, sessionChecker(), bodyParser(), changeName())
        .get(ACCOUNTS, JSONQuerystringParser(), accounts())
        .post(ADD_ACCOUNT, sessionChecker(), bodyParser(), addAccount())
        .post(ADD_ACCOUNTS, sessionChecker(), bodyParser(), addAccounts())
        .post(REMOVE_ACCOUNTS, sessionChecker(), bodyParser(), removeAccounts())
        .get(GET_BY_ACCOUNT, JSONQuerystringParser(), getByAccount())
        .get(GET_ADMINISTRATING_BY_ACCOUNT, JSONQuerystringParser(), getAdministratingByAccount())
        .get(ADMINS, JSONQuerystringParser(), admins())
        .post(ADD_ADMIN, sessionChecker(), bodyParser(), addAdmin())
        .post(ADD_ADMINS, sessionChecker(), bodyParser(), addAdmins())
        .post(REMOVE_ADMINS, sessionChecker(), bodyParser(), removeAdmins())
        .get(GET_BY_REPOSITORY, JSONQuerystringParser(), getByRepository())
        .get(REPOSITORIES, JSONQuerystringParser(), repositories())
        .post(ADD_REPOSITORY, sessionChecker(), bodyParser(), addRepository())
        .post(REMOVE_REPOSITORIES, sessionChecker(), bodyParser(), removeRepositories())
        .get(IS_ADMIN, JSONQuerystringParser(), isAdmin());
};