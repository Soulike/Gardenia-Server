import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {ACCOUNTS, INFO} from './ROUTE';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import {accounts, info} from './Middleware';

export default (router: Router<IState, IContext>) =>
{
    router.get(INFO, JSONQueryParameterParser(), info());
    router.get(ACCOUNTS, JSONQueryParameterParser(), accounts());
};