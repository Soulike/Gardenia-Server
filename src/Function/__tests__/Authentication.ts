import {getAccountFromAuthenticationHeader} from '../Authentication';
import {Base64} from 'js-base64';
import faker from 'faker';
import {Account} from '../../Class';

describe(`${getAccountFromAuthenticationHeader.name}`, () =>
{
    const fakeUsername = faker.name.firstName();
    const fakePassword = faker.random.alphaNumeric(15);
    const fakeHash = Account.calculateHash(fakeUsername, fakePassword);

    it('should get account', function ()
    {
        const authorizationHeader = `Basic ${Base64.encode(`${fakeUsername}:${fakePassword}`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getAccountFromAuthenticationHeader(headers))
            .toEqual(new Account(fakeUsername, fakeHash));
    });

    it('should return null when no authorization header', function ()
    {
        const headers = {};
        expect(getAccountFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when authentication method is wrong', function ()
    {
        const authorizationHeader = `advanced ${Base64.encode(`${fakeUsername}:${fakePassword}`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getAccountFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when lack of authentication method', function ()
    {
        const authorizationHeader = `${Base64.encode(`${fakeUsername}:${fakePassword}`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getAccountFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when format is wrong', function ()
    {
        const authorizationHeader = `Basic ${Base64.encode(`${fakeUsername},${fakePassword}`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getAccountFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when lack of username', function ()
    {
        const authorizationHeader = `Basic ${Base64.encode(`:${fakePassword}`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getAccountFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when lack of password', function ()
    {
        const authorizationHeader = `Basic ${Base64.encode(`${fakeUsername}:`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getAccountFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when content is not base64', function ()
    {
        const authorizationHeader = `Basic ${fakeUsername}:${fakePassword}`;
        const headers = {authorization: authorizationHeader};
        expect(getAccountFromAuthenticationHeader(headers))
            .toBeNull();
    });
});