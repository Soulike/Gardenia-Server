import {generateVerificationCode, getAccountFromAuthenticationHeader} from '../Authentication';
import {Base64} from 'js-base64';
import {Account} from '../../Class';

describe('getAccountFromAuthenticationHeader', () =>
{
    it('应当从请求头中获取认证信息', function ()
    {
        const username = 'faefae';
        const password = 'ggsghsrh';
        const header = {authorization: `Basic ${Base64.encode(`${username}:${password}`)}`};
        expect(getAccountFromAuthenticationHeader(header))
            .toEqual(new Account(username, Account.calculateHash(username, password)));
    });

    it('应当在认证信息不存在时返回 null', function ()
    {
        const header = {};
        expect(getAccountFromAuthenticationHeader(header)).toBeNull();
    });

    it('应当在认证信息格式不正确时返回 null', function ()
    {
        const header = {authorization: `Basic afaefae:feagaeg`};
        expect(getAccountFromAuthenticationHeader(header)).toBeNull();
    });

    it('应当在认证类型错误时返回 null', function ()
    {
        const username = 'faefae';
        const password = 'ggsghsrh';
        const header = {authorization: `Digest ${Base64.encode(`${username}:${password}`)}`};
        expect(getAccountFromAuthenticationHeader(header))
            .toBeNull();
    });
});

describe('generateVerificationCode', () =>
{
    it('应当生成每次不同的验证码', function ()
    {
        expect(generateVerificationCode()).not.toBe(generateVerificationCode());
    });

    it('应当生成 6 位的验证码', function ()
    {
        expect(generateVerificationCode().length).toBe(6);
    });
});