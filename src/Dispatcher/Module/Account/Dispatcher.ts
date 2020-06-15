import Router from '@koa/router';
import {
    CHANGE_PASSWORD,
    CHECK_IF_USERNAME_AVAILABLE,
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
import sessionChecker from '../../Middleware/sessionChecker';
import {
    changePassword,
    checkIfUsernameAvailable,
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
    router
        .post(LOGIN, bodyParser(), login())
        .post(REGISTER, bodyParser(), register())
        .get(CHECK_IF_USERNAME_AVAILABLE, JSONQuerystringParser(), checkIfUsernameAvailable())
        .post(SEND_VERIFICATION_CODE_BY_USERNAME, bodyParser(), sendVerificationCodeByUsername())
        .post(SEND_VERIFICATION_CODE_TO_EMAIL, bodyParser(), sendVerificationCodeToEmail())
        .post(CHANGE_PASSWORD, bodyParser(), changePassword())
        .get(CHECK_SESSION, JSONQuerystringParser(), checkSession())
        .post(LOGOUT, bodyParser(), logout())
        .post(CHECK_PASSWORD, sessionChecker(), bodyParser(), checkPassword());
};