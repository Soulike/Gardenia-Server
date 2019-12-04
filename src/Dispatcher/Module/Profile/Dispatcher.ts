import Router from '@koa/router';
import {GET, SET, UPLOAD_AVATAR} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import bodyParser from '../../Middleware/bodyParser';
import {get, set, uploadAvatar} from './Middleware';
import {IContext, IState} from '../../Interface';

export default (router: Router<IState, IContext>) =>
{
    router.get(GET, JSONQuerystringParser(), get());
    router.post(SET, bodyParser(), set());
    router.post(UPLOAD_AVATAR, bodyParser(), uploadAvatar());
};