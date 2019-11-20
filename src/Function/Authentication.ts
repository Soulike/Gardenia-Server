import {Base64} from 'js-base64';
import {Account} from '../Class';

export function getAccountFromAuthenticationHeader(headers: any): Account | null
{
    const {authorization} = headers;
    if (typeof authorization !== 'string')
    {
        return null;
    }
    const authorizationSplit = authorization.split(' ');
    if (authorizationSplit.length !== 2)
    {
        return null;
    }
    const [method, authInfoInBase64] = authorizationSplit;
    if (method.toLowerCase() !== 'basic' || authInfoInBase64.length === 0)
    {
        return null;
    }
    const authInfo = Base64.decode(authInfoInBase64);
    const authInfoSplit = authInfo.split(':');
    if (authInfoSplit.length !== 2)
    {
        return null;
    }
    const [username, password] = authInfoSplit;
    if (username.length === 0 || password.length === 0)
    {
        return null;
    }
    return {username, hash: Account.calculateHash(username, password)};
}