import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {ACCOUNTS, ADD_ACCOUNTS, INFO} from './ROUTE';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import {accounts, addAccounts, info} from './Middleware';
import POSTBodyParser from '../../Middleware/POSTBodyParser';

export default (router: Router<IState, IContext>) =>
{
    router.get(INFO, JSONQueryParameterParser(), info());
    router.get(ACCOUNTS, JSONQueryParameterParser(), accounts());
    router.post(ADD_ACCOUNTS, POSTBodyParser(), addAccounts());
};