import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {
    ACCOUNTS,
    ADD,
    ADD_ACCOUNT,
    ADD_ACCOUNTS,
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

export default (router: Router<IState, IContext>) =>
{
    router
        .post(ADD, bodyParser(), add())
        .post(DISMISS, bodyParser(), dismiss())
        .get(INFO, JSONQuerystringParser(), info())
        .post(CHANGE_NAME, bodyParser(), changeName())
        .get(ACCOUNTS, JSONQuerystringParser(), accounts())
        .post(ADD_ACCOUNT, bodyParser(), addAccount())
        .post(ADD_ACCOUNTS, bodyParser(), addAccounts())
        .post(REMOVE_ACCOUNTS, bodyParser(), removeAccounts())
        .get(GET_BY_ACCOUNT, JSONQuerystringParser(), getByAccount())
        .get(GET_ADMINISTRATING_BY_ACCOUNT, JSONQuerystringParser(), getAdministratingByAccount())
        .get(ADMINS, JSONQuerystringParser(), admins())
        .post(ADD_ADMINS, bodyParser(), addAdmins())
        .post(REMOVE_ADMINS, bodyParser(), removeAdmins())
        .get(GET_BY_REPOSITORY, JSONQuerystringParser(), getByRepository())
        .get(REPOSITORIES, JSONQuerystringParser(), repositories())
        .post(ADD_REPOSITORY, bodyParser(), addRepository())
        .post(REMOVE_REPOSITORIES, bodyParser(), removeRepositories())
        .get(IS_ADMIN, JSONQuerystringParser(), isAdmin());
};