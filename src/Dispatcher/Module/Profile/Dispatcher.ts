import Router from '@koa/router';
import {GET, GET_BY_EMAIL, SET, UPLOAD_AVATAR} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import bodyParser from '../../Middleware/bodyParser';
import {get, getByEmail, set, uploadAvatar} from './Middleware';
import {IContext, IState} from '../../Interface';

export default (router: Router<IState, IContext>) =>
{
    router.get(GET, JSONQuerystringParser(), get());
    router.get(GET_BY_EMAIL, JSONQuerystringParser(), getByEmail());
    router.post(SET, bodyParser(), set());
    router.post(UPLOAD_AVATAR, bodyParser(), uploadAvatar());
};