import 'jest-extended';
import {get, set, uploadAvatar} from '../ParameterValidator';
import {Profile} from '../../../../Class';

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
    it('should handle body with only nickname (string)', async function ()
    {
        const fakeBody: Partial<Omit<Profile, 'avatar' | 'username'>> =
            {nickname: 'afaef'};
        expect(set(fakeBody)).toBeTrue();
    });

    it('should handle body with only email (valid)', async function ()
    {
        const fakeBody: Partial<Omit<Profile, 'avatar' | 'username'>> =
            {email: 'a@b.com'};
        expect(set(fakeBody)).toBeTrue();
    });

    it('should handle body with only nickname (not a string)', async function ()
    {
        const fakeBody =
            {nickname: 2};
        expect(set(fakeBody)).toBeFalse();
    });

    it('should handle body with only email (invalid)', async function ()
    {
        const fakeBody =
            {email: 2323};
        expect(set(fakeBody)).toBeFalse();
    });

    it('should handle body with email (invalid) and nickname (string)', async function ()
    {
        const fakeBody =
            {email: 4745756, nickname: 'dfaf'};
        expect(set(fakeBody)).toBeFalse();
    });

    it('should handle body with email and nickname', async function ()
    {
        const fakeBody: Partial<Omit<Profile, 'avatar' | 'username'>> =
            {email: 'a@b.com', nickname: 'dfaf'};
        expect(set(fakeBody)).toBeTrue();
    });

    it('should handle empty body', async function ()
    {
        expect(set({})).toBeTrue();
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