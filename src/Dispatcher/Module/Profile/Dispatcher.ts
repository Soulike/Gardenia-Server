import Router from '@koa/router';
import {GET, SET, UPLOAD_AVATAR} from './ROUTE';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import POSTBodyParser from '../../Middleware/POSTBodyParser';
import {get, set, uploadAvatar} from './Middleware';
import {IContext, IState} from '../../Interface';

export default (router: Router<IState, IContext>) =>
{
    router.get(GET, JSONQueryParameterParser(), get());
    router.post(SET, POSTBodyParser(), set());
    router.post(UPLOAD_AVATAR, POSTBodyParser(), uploadAvatar());
};