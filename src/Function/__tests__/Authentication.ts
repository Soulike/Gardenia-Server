import {getUsernameAndPasswordFromAuthenticationHeader} from '../Authentication';
import {Base64} from 'js-base64';
import faker from 'faker';

describe('getUsernameAndPasswordFromAuthenticationHeader', () =>
{
    const fakeUsername = faker.name.firstName();
    const fakePassword = faker.random.alphaNumeric(15);

    it('should get username and password', function ()
    {
        const authorizationHeader = `Basic ${Base64.encode(`${fakeUsername}:${fakePassword}`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getUsernameAndPasswordFromAuthenticationHeader(headers))
            .toEqual({
                username: fakeUsername,
                password: fakePassword,
            });
    });

    it('should return null when no authorization header', function ()
    {
        const headers = {};
        expect(getUsernameAndPasswordFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when authentication method is wrong', function ()
    {
        const authorizationHeader = `advanced ${Base64.encode(`${fakeUsername}:${fakePassword}`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getUsernameAndPasswordFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when lack of authentication method', function ()
    {
        const authorizationHeader = `${Base64.encode(`${fakeUsername}:${fakePassword}`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getUsernameAndPasswordFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when format is wrong', function ()
    {
        const authorizationHeader = `Basic ${Base64.encode(`${fakeUsername},${fakePassword}`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getUsernameAndPasswordFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when lack of username', function ()
    {
        const authorizationHeader = `Basic ${Base64.encode(`:${fakePassword}`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getUsernameAndPasswordFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when lack of password', function ()
    {
        const authorizationHeader = `Basic ${Base64.encode(`${fakeUsername}:`)}`;
        const headers = {authorization: authorizationHeader};
        expect(getUsernameAndPasswordFromAuthenticationHeader(headers))
            .toBeNull();
    });

    it('should return null when content is not base64', function ()
    {
        const authorizationHeader = `Basic ${fakeUsername}:${fakePassword}`;
        const headers = {authorization: authorizationHeader};
        expect(getUsernameAndPasswordFromAuthenticationHeader(headers))
            .toBeNull();
    });
});