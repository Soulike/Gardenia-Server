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
import * as ParameterValidator from './ParameterValidator';

export default (router: Router<IState, IContext>) =>
{
    router
        .post(ADD, sessionChecker(), bodyParser(), ParameterValidator.add(), add())
        .post(DISMISS, sessionChecker(), bodyParser(), ParameterValidator.dismiss(), dismiss())
        .get(INFO, JSONQuerystringParser(), ParameterValidator.info(), info())
        .post(CHANGE_NAME, sessionChecker(), bodyParser(), ParameterValidator.changeName(), changeName())
        .get(ACCOUNTS, JSONQuerystringParser(), ParameterValidator.accounts(), accounts())
        .post(ADD_ACCOUNT, sessionChecker(), bodyParser(), ParameterValidator.addAccount(), addAccount())
        .post(ADD_ACCOUNTS, sessionChecker(), bodyParser(), ParameterValidator.addAccounts(), addAccounts())
        .post(REMOVE_ACCOUNTS, sessionChecker(), bodyParser(), ParameterValidator.removeAccounts(), removeAccounts())
        .get(GET_BY_ACCOUNT, JSONQuerystringParser(), ParameterValidator.getByAccount(), getByAccount())
        .get(GET_ADMINISTRATING_BY_ACCOUNT, JSONQuerystringParser(), ParameterValidator.getAdministratingByAccount(), getAdministratingByAccount())
        .get(ADMINS, JSONQuerystringParser(), ParameterValidator.admins(), admins())
        .post(ADD_ADMIN, sessionChecker(), bodyParser(), ParameterValidator.addAdmin(), addAdmin())
        .post(ADD_ADMINS, sessionChecker(), bodyParser(), ParameterValidator.addAdmins(), addAdmins())
        .post(REMOVE_ADMINS, sessionChecker(), bodyParser(), ParameterValidator.removeAdmins(), removeAdmins())
        .get(GET_BY_REPOSITORY, JSONQuerystringParser(), ParameterValidator.getByRepository(), getByRepository())
        .get(REPOSITORIES, JSONQuerystringParser(), ParameterValidator.repositories(), repositories())
        .post(ADD_REPOSITORY, sessionChecker(), bodyParser(), ParameterValidator.addRepository(), addRepository())
        .post(REMOVE_REPOSITORIES, sessionChecker(), bodyParser(), ParameterValidator.removeRepositories(), removeRepositories())
        .get(IS_ADMIN, JSONQuerystringParser(), ParameterValidator.isAdmin(), isAdmin());
};