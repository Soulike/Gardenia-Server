import {Repository} from '../Repository';
import faker from 'faker';

describe(`${Repository.name}`, () =>
{
    const fakeUsername = faker.name.firstName();
    const fakeName = faker.random.word();
    const fakeDescription = faker.lorem.sentence();
    const fakeIsPublic = faker.random.boolean();

    it(`should construct ${Repository.name} object`, function ()
    {
        expect(new Repository(fakeUsername, fakeName, fakeDescription, fakeIsPublic))
            .toEqual({
                username: fakeUsername,
                name: fakeName,
                description: fakeDescription,
                isPublic: fakeIsPublic,
            } as Repository);
    });

    it(`${Repository.from.name} method should return new ${Repository.from.name} object`, function ()
    {
        const repository = Repository.from({
            username: fakeUsername,
            name: fakeName,
            description: fakeDescription,
            isPublic: fakeIsPublic,
        });
        expect(repository).toBeInstanceOf(Repository);
        expect(repository).toEqual(new Repository(fakeUsername, fakeName, fakeDescription, fakeIsPublic));
    });

    it(`${Repository.from.name} method should throw error when source object owns wrong data type`, function ()
    {
        expect(() => Repository.from({
            username: 12345,
            name: fakeName,
            description: fakeDescription,
            isPublic: fakeIsPublic,
        })).toThrow(TypeError);
        expect(() => Repository.from({
            username: fakeUsername,
            name: {},
            description: fakeDescription,
            isPublic: fakeIsPublic,
        })).toThrow(TypeError);
        expect(() => Repository.from({
            username: fakeUsername,
            name: fakeName,
            description: 5,
            isPublic: fakeIsPublic,
        })).toThrow(TypeError);
        expect(() => Repository.from({
            username: fakeUsername,
            name: fakeName,
            description: fakeDescription,
            isPublic: null,
        })).toThrow(TypeError);
    });

    it(`${Repository.validate.name} method should validate data type of source object`, function ()
    {
        expect(Repository.validate({
            username: fakeUsername,
            name: fakeName,
            description: fakeDescription,
            isPublic: fakeIsPublic,
        })).toBe(true);
        expect(Repository.validate({
            username: 12345,
            name: fakeName,
            description: fakeDescription,
            isPublic: fakeIsPublic,
        })).toBe(false);
        expect(Repository.validate({
            username: fakeUsername,
            name: {},
            description: fakeDescription,
            isPublic: fakeIsPublic,
        })).toBe(false);
        expect(Repository.validate({
            username: fakeUsername,
            name: fakeName,
            description: 5,
            isPublic: fakeIsPublic,
        })).toBe(false);
        expect(Repository.validate({
            username: fakeUsername,
            name: fakeName,
            description: fakeDescription,
            isPublic: null,
        })).toBe(false);
    });
});