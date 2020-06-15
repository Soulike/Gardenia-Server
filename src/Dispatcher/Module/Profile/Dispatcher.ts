import Router from '@koa/router';
import {
    GET,
    GET_BY_EMAIL,
    SEND_SET_EMAIL_VERIFICATION_CODE_TO_EMAIL,
    SET_EMAIL,
    SET_NICKNAME,
    UPLOAD_AVATAR,
} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import bodyParser from '../../Middleware/bodyParser';
import {get, getByEmail, sendSetEmailVerificationCodeToEmail, setEmail, setNickname, uploadAvatar} from './Middleware';
import {IContext, IState} from '../../Interface';
import sessionChecker from '../../Middleware/sessionChecker';

export default (router: Router<IState, IContext>) =>
{
    router
        .get(GET, JSONQuerystringParser(), get())
        .get(GET_BY_EMAIL, JSONQuerystringParser(), getByEmail())
        .post(SET_NICKNAME, sessionChecker(), bodyParser(), setNickname())
        .post(SET_EMAIL, sessionChecker(), bodyParser(), setEmail())
        .post(SEND_SET_EMAIL_VERIFICATION_CODE_TO_EMAIL, bodyParser(), sendSetEmailVerificationCodeToEmail())
        .post(UPLOAD_AVATAR, sessionChecker(), bodyParser(), uploadAvatar());
}