import {Profile} from '../Profile';
import faker from 'faker';

describe(`${Profile.name}`, () =>
{
    const fakeUsername = faker.name.firstName();
    const fakeNickname = faker.random.word();
    const fakeAvatar = faker.random.alphaNumeric(1024);
    const fakeEmail = faker.internet.email();

    it(`should construct ${Profile.name} object`, function ()
    {
        expect(new Profile(fakeUsername, fakeNickname, fakeEmail, fakeAvatar))
            .toEqual({
                username: fakeUsername,
                nickname: fakeNickname,
                avatar: fakeAvatar,
                email: fakeEmail,
            } as Profile);
    });

    it(`should throw error if email is invalid when constructing ${Profile.name} object`, function ()
    {
        expect(() => new Profile(fakeUsername, fakeNickname, 'dawdaw', fakeAvatar))
            .toThrow(TypeError);
    });

    it(`${Profile.from.name} method should return new ${Profile.name} object`, function ()
    {
        const profile = Profile.from({
            username: fakeUsername,
            nickname: fakeNickname,
            avatar: fakeAvatar,
            email: fakeEmail,
        });
        expect(profile).toBeInstanceOf(Profile);
        expect(profile).toEqual(new Profile(fakeUsername, fakeNickname, fakeEmail, fakeAvatar));
    });

    it(`${Profile.from.name} method should throw error when source object owns wrong data type`, function ()
    {
        expect(() => Profile.from({
            username: 12345,
            nickname: fakeNickname,
            avatar: fakeAvatar,
            email: fakeEmail,
        })).toThrow(TypeError);
        expect(() => Profile.from({
            username: fakeUsername,
            nickname: {},
            avatar: fakeAvatar,
            email: fakeEmail,
        })).toThrow(TypeError);
        expect(() => Profile.from({
            username: fakeUsername,
            nickname: fakeNickname,
            avatar: [],
            email: fakeEmail,
        })).toThrow(TypeError);
        expect(() => Profile.from({
            username: fakeUsername,
            nickname: fakeNickname,
            avatar: fakeAvatar,
            email: Symbol(),
        })).toThrow(TypeError);
    });

    it(`${Profile.from.name} method should throw error when source object owns invalid email`, function ()
    {
        expect(() => Profile.from({
            username: fakeUsername,
            nickname: fakeNickname,
            avatar: fakeAvatar,
            email: 'fafaegeasg',
        })).toThrow(TypeError);
    });

    it(`${Profile.validate.name} method should validate data type of source object`, function ()
    {
        expect(Profile.validate({
            username: fakeUsername,
            nickname: fakeNickname,
            avatar: fakeAvatar,
            email: fakeEmail,
        })).toBe(true);
        expect(Profile.validate({
            username: 12345,
            nickname: fakeNickname,
            avatar: fakeAvatar,
            email: fakeEmail,
        })).toBe(false);
        expect(Profile.validate({
            username: fakeUsername,
            nickname: {},
            avatar: fakeAvatar,
            email: fakeEmail,
        })).toBe(false);
        expect(Profile.validate({
            username: fakeUsername,
            nickname: fakeNickname,
            avatar: [],
            email: fakeEmail,
        })).toBe(false);
        expect(Profile.validate({
            username: fakeUsername,
            nickname: fakeNickname,
            avatar: fakeAvatar,
            email: Symbol(),
        })).toBe(false);
    });

    it(`${Profile.validate.name} method should validate email of source object`, function ()
    {
        expect(Profile.validate({
            username: fakeUsername,
            nickname: fakeNickname,
            avatar: fakeAvatar,
            email: 'fafaegeasg',
        })).toBe(false);
    });
});