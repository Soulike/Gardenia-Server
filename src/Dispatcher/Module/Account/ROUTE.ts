import {prefix} from '../../Function';

function accountPrefix(url: string): string
{
    return prefix(`/account${url}`);
}

export const LOGIN = accountPrefix('/login');
export const REGISTER = accountPrefix('/register');
export const CHECK_IF_USERNAME_AVAILABLE = accountPrefix('/checkIfUsernameAvailable');
export const SEND_VERIFICATION_CODE_BY_USERNAME = accountPrefix('/sendVerificationCodeByUsername');
export const SEND_VERIFICATION_CODE_TO_EMAIL = accountPrefix('/sendVerificationCodeToEmail');
export const CHANGE_PASSWORD = accountPrefix('/changePassword');
export const CHECK_SESSION = accountPrefix('/checkSession');
export const LOGOUT = accountPrefix('/logout');
export const CHECK_PASSWORD = accountPrefix('/checkPassword');