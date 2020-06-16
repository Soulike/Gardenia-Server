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
import * as ParameterValidator from './ParameterValidator';
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
import {IDispatcher} from '../../Interface';

export default (router =>
{
    router
        .post(LOGIN, bodyParser(), ParameterValidator.login(), login())
        .post(REGISTER, bodyParser(), ParameterValidator.register(), register())
        .get(CHECK_IF_USERNAME_AVAILABLE, JSONQuerystringParser(), ParameterValidator.checkIfUsernameAvailable(), checkIfUsernameAvailable())
        .post(SEND_VERIFICATION_CODE_BY_USERNAME, bodyParser(), ParameterValidator.sendVerificationCodeByUsername(), sendVerificationCodeByUsername())
        .post(SEND_VERIFICATION_CODE_TO_EMAIL, bodyParser(), ParameterValidator.sendVerificationCodeToEmail(), sendVerificationCodeToEmail())
        .post(CHANGE_PASSWORD, bodyParser(), ParameterValidator.changePassword(), changePassword())
        .get(CHECK_SESSION, JSONQuerystringParser(), checkSession())
        .post(LOGOUT, bodyParser(), logout())
        .post(CHECK_PASSWORD, sessionChecker(), bodyParser(), ParameterValidator.checkPassword(), checkPassword());
}) as IDispatcher;