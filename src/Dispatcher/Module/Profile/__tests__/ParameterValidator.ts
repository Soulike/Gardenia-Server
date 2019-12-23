import 'jest-extended';
import {get, set, uploadAvatar} from '../ParameterValidator';

describe(`get`, () =>
{
    it('should handle account is nonexistent', function ()
    {
        const fakeBody = {};
        expect(get(fakeBody)).toBeTrue();
    });

    it('should handle account.username is not a string', function ()
    {
        const fakeBody = {account: {username: 11}};
        expect(get(fakeBody)).toBeFalse();
    });

    it('should handle account.username is a string', function ()
    {
        const fakeBody = {account: {username: 'gaegaeg'}};
        expect(get(fakeBody)).toBeTrue();
    });
});

describe(`set`, () =>
{
    it('should handle email is not a string', function ()
    {
        const fakeBody = {
            email: 123,
            nickname: 'gaegaeg',
        };
        expect(set(fakeBody)).toBeFalse();
    });

    it('should handle email is not a valid email', function ()
    {
        const fakeBody = {
            email: '123',
            nickname: 'gaegaeg',
        };
        expect(set(fakeBody)).toBeFalse();
    });

    it('should handle nickname is not a string', function ()
    {
        const fakeBody = {
            email: '123',
            nickname: 1111,
        };
        expect(set(fakeBody)).toBeFalse();
    });

    it('should handle nickname is string and email is a valid email', function ()
    {
        const fakeBody = {
            email: '123@b.com',
            nickname: '1111',
        };
        expect(set(fakeBody)).toBeTrue();
    });
});

describe('uploadAvatar', () =>
{
    it('should handle avatar is nonexistent', function ()
    {
        const fakeFiles = {};
        expect(uploadAvatar(fakeFiles)).toBeFalse();
    });

    it('should handle avatar is null', function ()
    {
        const fakeFiles = {avatar: null};
        expect(uploadAvatar(fakeFiles)).toBeFalse();
    });

    it('should handle avatar is existent and is not null', function ()
    {
        const fakeFiles = {avatar: []};
        expect(uploadAvatar(fakeFiles)).toBeTrue();
    });
});