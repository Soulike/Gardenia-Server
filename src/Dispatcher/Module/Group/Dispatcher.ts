import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {
    ACCOUNTS,
    ADD,
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
    router.post(ADD, bodyParser(), add());
    router.post(DISMISS, bodyParser(), dismiss());
    router.get(INFO, JSONQuerystringParser(), info());
    router.post(CHANGE_NAME, bodyParser(), changeName());
    router.get(ACCOUNTS, JSONQuerystringParser(), accounts());
    router.post(ADD_ACCOUNTS, bodyParser(), addAccounts());
    router.post(REMOVE_ACCOUNTS, bodyParser(), removeAccounts());
    router.get(GET_BY_ACCOUNT, JSONQuerystringParser(), getByAccount());
    router.get(GET_ADMINISTRATING_BY_ACCOUNT, JSONQuerystringParser(), getAdministratingByAccount());
    router.get(ADMINS, JSONQuerystringParser(), admins());
    router.post(ADD_ADMINS, bodyParser(), addAdmins());
    router.post(REMOVE_ADMINS, bodyParser(), removeAdmins());
    router.get(GET_BY_REPOSITORY, JSONQuerystringParser(), getByRepository());
    router.get(REPOSITORIES, JSONQuerystringParser(), repositories());
    router.post(ADD_REPOSITORY, bodyParser(), addRepository());
    router.post(REMOVE_REPOSITORIES, bodyParser(), removeRepositories());
    router.get(IS_ADMIN, JSONQuerystringParser(), isAdmin());
};