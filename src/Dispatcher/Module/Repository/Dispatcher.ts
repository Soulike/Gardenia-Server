import Router from '@koa/router';
import {CREATE, DEL, GET_LIST} from './ROUTE';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import {create, del, getList} from './Middleware';
import POSTBodyParser from '../../Middleware/POSTBodyParser';

export default (router: Router) =>
{
    router.post(CREATE, POSTBodyParser(), create());
    router.post(DEL, POSTBodyParser(), del());
    router.get(GET_LIST, JSONQueryParameterParser(), getList());
};