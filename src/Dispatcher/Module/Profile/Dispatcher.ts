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
import * as ParameterValidator from './ParameterValidator';

export default (router: Router<IState, IContext>) =>
{
    router
        .get(GET, JSONQuerystringParser(), ParameterValidator.get(), get())
        .get(GET_BY_EMAIL, JSONQuerystringParser(), ParameterValidator.getByEmail(), getByEmail())
        .post(SET_NICKNAME, sessionChecker(), bodyParser(), ParameterValidator.setNickname(), setNickname())
        .post(SET_EMAIL, sessionChecker(), bodyParser(), ParameterValidator.setEmail(), setEmail())
        .post(SEND_SET_EMAIL_VERIFICATION_CODE_TO_EMAIL, bodyParser(), ParameterValidator.sendSetEmailVerificationCodeToEmail(), sendSetEmailVerificationCodeToEmail())
        .post(UPLOAD_AVATAR, sessionChecker(), bodyParser(), ParameterValidator.uploadAvatar(), uploadAvatar());
}