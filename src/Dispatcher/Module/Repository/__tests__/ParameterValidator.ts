import {create, del, getRepositories} from '../ParameterValidator';
import 'jest-extended';
import {Repository} from '../../../../Class';

describe(`getRepositories`, () =>
{
    it('should handle body with start (not a number)', async function ()
    {
        const fakeBody = {
            start: 'gaeae',
            end: 2,
            username: 'afawf',
        };
        expect(getRepositories(fakeBody)).toBeFalse();
    });

    it('should handle body with end (not a number)', async function ()
    {
        const fakeBody = {
            start: 1,
            end: '2',
            username: 'afawf',
        };
        expect(getRepositories(fakeBody)).toBeFalse();
    });

    it('should handle body without username', async function ()
    {
        const fakeBody = {
            start: 1,
            end: 2,
        };
        expect(getRepositories(fakeBody)).toBeTrue();
    });

    it('should handle body with username (not a string)', async function ()
    {
        const fakeBody = {
            start: 1,
            end: 2,
            username: 3,
        };
        expect(getRepositories(fakeBody)).toBeFalse();
    });

    it('should handle body with start (a number), end (a number) and username (a string)', async function ()
    {
        const fakeBody = {
            start: 1,
            end: 2,
            username: 'afawf',
        };
        expect(getRepositories(fakeBody)).toBeTrue();
    });
});

describe(`create`, () =>
{
    it('should handle body with name (a string), description (a string) and isPublic (a boolean)', function ()
    {
        const fakeBody: Omit<Repository, 'username'> = {
            name: '', description: '', isPublic: true,
        };
        expect(create(fakeBody)).toBeTrue();
    });

    it('should handle body with name (not a string)', function ()
    {
        const fakeBody: Record<keyof Omit<Repository, 'username'>, any> = {
            name: 2, description: '', isPublic: true,
        };
        expect(create(fakeBody)).toBeFalse();
    });

    it('should handle body with description (not a string)', function ()
    {
        const fakeBody: Record<keyof Omit<Repository, 'username'>, any> = {
            name: '', description: Symbol(), isPublic: true,
        };
        expect(create(fakeBody)).toBeFalse();
    });

    it('should handle body with isPublic (not a boolean)', function ()
    {
        const fakeBody: Record<keyof Omit<Repository, 'username'>, any> = {
            name: '', description: '', isPublic: 'gaega',
        };
        expect(create(fakeBody)).toBeFalse();
    });
});

describe(`del`, () =>
{
    it('should handle body with name (a string)', function ()
    {
        const fakeBody: Pick<Repository, 'name'> = {
            name: 'faefae',
        };
        expect(del(fakeBody)).toBeTrue();
    });

    it('should handle body with name (not a string)', function ()
    {
        const fakeBody: Record<keyof Pick<Repository, 'name'>, any> = {
            name: true,
        };
        expect(del(fakeBody)).toBeFalse();
    });
});