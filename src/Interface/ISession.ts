import {VERIFICATION_CODE_TYPE} from '../CONSTANT';
import {Account} from '../Class';

export interface ISession
{
    username?: Account['username'],
    verification?: {
        type: VERIFICATION_CODE_TYPE,
        email: string,
        verificationCode: string
    }
}