import Router from '@koa/router';
import {GET, GET_BY_EMAIL, SEND_SET_EMAIL_VERIFICATION_CODE_TO_EMAIL, SET, SET_EMAIL, UPLOAD_AVATAR} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import bodyParser from '../../Middleware/bodyParser';
import {get, getByEmail, sendSetEmailVerificationCodeToEmail, set, setEmail, uploadAvatar} from './Middleware';
import {IContext, IState} from '../../Interface';

export default (router: Router<IState, IContext>) =>
{
    router
        .get(GET, JSONQuerystringParser(), get())
        .get(GET_BY_EMAIL, JSONQuerystringParser(), getByEmail())
        .post(SET, bodyParser(), set())
        .post(SET_EMAIL, bodyParser(), setEmail())
        .post(SEND_SET_EMAIL_VERIFICATION_CODE_TO_EMAIL, bodyParser(), sendSetEmailVerificationCodeToEmail())
        .post(UPLOAD_AVATAR, bodyParser(), uploadAvatar());
}