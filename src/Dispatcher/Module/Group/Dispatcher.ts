import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {
    ACCOUNTS,
    ADD_ACCOUNTS,
    ADD_ADMINS,
    ADMINS,
    INFO,
    REMOVE_ACCOUNTS,
    REMOVE_ADMINS,
    REMOVE_REPOSITORIES,
    REPOSITORIES,
} from './ROUTE';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import {
    accounts,
    addAccounts,
    addAdmins,
    admins,
    info,
    removeAccounts,
    removeAdmins,
    removeRepositories,
    repositories,
} from './Middleware';
import POSTBodyParser from '../../Middleware/POSTBodyParser';

export default (router: Router<IState, IContext>) =>
{
    router.get(INFO, JSONQueryParameterParser(), info());
    router.get(ACCOUNTS, JSONQueryParameterParser(), accounts());
    router.post(ADD_ACCOUNTS, POSTBodyParser(), addAccounts());
    router.post(REMOVE_ACCOUNTS, POSTBodyParser(), removeAccounts());
    router.get(ADMINS, JSONQueryParameterParser(), admins());
    router.post(ADD_ADMINS, POSTBodyParser(), addAdmins());
    router.post(REMOVE_ADMINS, POSTBodyParser(), removeAdmins());
    router.get(REPOSITORIES, JSONQueryParameterParser(), repositories());
    router.post(REMOVE_REPOSITORIES, POSTBodyParser(), removeRepositories());
};