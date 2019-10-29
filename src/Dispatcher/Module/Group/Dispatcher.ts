import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {INFO} from './ROUTE';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import {info} from './Middleware';

export default (router: Router<IState, IContext>) =>
{
    router.get(INFO, JSONQueryParameterParser(), info());
};