import Router from '@koa/router';
import {GET} from './ROUTE';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import {get} from './Middleware';

export default (router: Router) =>
{
    router.get(GET, JSONQueryParameterParser(), get());
};