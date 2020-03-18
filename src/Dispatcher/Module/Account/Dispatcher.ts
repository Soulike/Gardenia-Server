import Router from '@koa/router';
import {
    CHANGE_PASSWORD,
    CHECK_PASSWORD,
    CHECK_SESSION,
    LOGIN,
    LOGOUT,
    REGISTER,
    SEND_VERIFICATION_CODE_BY_USERNAME,
    SEND_VERIFICATION_CODE_TO_EMAIL,
} from './ROUTE';
import bodyParser from '../../Middleware/bodyParser';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import {
    changePassword,
    checkPassword,
    checkSession,
    login,
    logout,
    register,
    sendVerificationCodeByUsername,
    sendVerificationCodeToEmail,
} from './Middleware';
import {IContext, IState} from '../../Interface';

export default (router: Router<IState, IContext>) =>
{
    router.post(LOGIN, bodyParser(), login());
    router.post(REGISTER, bodyParser(), register());
    router.post(SEND_VERIFICATION_CODE_BY_USERNAME, bodyParser(), sendVerificationCodeByUsername());
    router.post(SEND_VERIFICATION_CODE_TO_EMAIL, bodyParser(), sendVerificationCodeToEmail());
    router.post(CHANGE_PASSWORD, bodyParser(), changePassword());
    router.get(CHECK_SESSION, JSONQuerystringParser(), checkSession());
    router.post(LOGOUT, bodyParser(), logout());
    router.post(CHECK_PASSWORD, bodyParser(), checkPassword());
};