import {
    GET,
    GET_BY_EMAIL,
    SEARCH,
    SEND_SET_EMAIL_VERIFICATION_CODE_TO_EMAIL,
    SET_EMAIL,
    SET_NICKNAME,
    UPLOAD_AVATAR,
} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import bodyParser from '../../Middleware/bodyParser';
import {
    get,
    getByEmail,
    search,
    sendSetEmailVerificationCodeToEmail,
    setEmail,
    setNickname,
    uploadAvatar,
} from './Middleware';
import {IDispatcher} from '../../Interface';
import sessionChecker from '../../Middleware/sessionChecker';
import * as ParameterValidator from './ParameterValidator';
import rateLimiter from '../../Middleware/rateLimiter';

export default (router =>
{
    router
        .get(GET, JSONQuerystringParser(), ParameterValidator.get(), get())
        .get(GET_BY_EMAIL, JSONQuerystringParser(), ParameterValidator.getByEmail(), getByEmail())
        .post(SET_NICKNAME, sessionChecker(), bodyParser(), ParameterValidator.setNickname(), setNickname())
        .post(SET_EMAIL, sessionChecker(), bodyParser(), ParameterValidator.setEmail(), setEmail())
        .post(SEND_SET_EMAIL_VERIFICATION_CODE_TO_EMAIL, bodyParser(), ParameterValidator.sendSetEmailVerificationCodeToEmail(), sendSetEmailVerificationCodeToEmail())
        .post(UPLOAD_AVATAR, sessionChecker(), bodyParser(), ParameterValidator.uploadAvatar(), uploadAvatar())
        .post(SEARCH, rateLimiter(120), bodyParser(), ParameterValidator.search(), search());
}) as IDispatcher;