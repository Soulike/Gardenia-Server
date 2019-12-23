import {add, addAccounts, dismiss, removeRepositories} from '../ParameterValidator';
import 'jest-extended';

describe(`add`, () =>
{
    it('should handle body without group', async function ()
    {
        const body = {};
        expect(add(body)).toBeFalse();
    });

    it('should handle body.group is null', async function ()
    {
        const body = {group: null};
        expect(add(body)).toBeFalse();
    });

    it('should handle body.group without name', async function ()
    {
        const body = {
            group: {},
        };
        expect(add(body)).toBeFalse();
    });

    it('should handle body.group with name (not string)', async function ()
    {
        const body = {
            group: {name: 2},
        };
        expect(add(body)).toBeFalse();
    });

    it('should handle body.group with name (string)', async function ()
    {
        const body = {
            group: {name: '2'},
        };
        expect(add(body)).toBeTrue();
    });
});

describe(`dismiss`, () =>
{
    it('should handle body without group', async function ()
    {
        const body = {};
        expect(dismiss(body)).toBeFalse();
    });

    it('should handle body.group is null', async function ()
    {
        const body = {group: null};
        expect(dismiss(body)).toBeFalse();
    });

    it('should handle body.group without id', async function ()
    {
        const body = {
            group: {},
        };
        expect(dismiss(body)).toBeFalse();
    });

    it('should handle body.group with id (not number)', async function ()
    {
        const body = {
            group: {id: '2'},
        };
        expect(dismiss(body)).toBeFalse();
    });

    it('should handle body.group with id (number)', async function ()
    {
        const body = {
            group: {id: 2},
        };
        expect(dismiss(body)).toBeTrue();
    });
});

describe(`addAccounts`, () =>
{
    it('should handle body without group', function ()
    {
        const body = {usernames: ['fafaef', 'gsrhsrh']};
        expect(addAccounts(body)).toBeFalse();
    });

    it('should handle body.group is null', async function ()
    {
        const body = {group: null};
        expect(addAccounts(body)).toBeFalse();
    });

    it('should handle body without usernames', function ()
    {
        const body = {group: {id: 1}};
        expect(addAccounts(body)).toBeFalse();
    });

    it('should handle body.group without id', function ()
    {
        const body = {group: {}, usernames: ['afaefaef', 'fgagae']};
        expect(addAccounts(body)).toBeFalse();
    });

    it('should handle body.group with id (not number)', function ()
    {
        const body = {group: {id: '2'}, usernames: ['afaefaef', 'fgagae']};
        expect(addAccounts(body)).toBeFalse();
    });

    it('should handle body.group with id (number)', function ()
    {
        const body = {group: {id: 2}, usernames: ['afaefaef', 'fgagae']};
        expect(addAccounts(body)).toBeTrue();
    });

    it('should handle body.usernames (not array)', function ()
    {
        const body = {group: {id: 2}, usernames: 'faefaegfae'};
        expect(addAccounts(body)).toBeFalse();
    });

    it('should handle body.usernames with strings', function ()
    {
        const body = {group: {id: 2}, usernames: ['afaefaef', 'fgagae']};
        expect(addAccounts(body)).toBeTrue();
    });

    it('should handle empty body.usernames', function ()
    {
        const body = {group: {id: 2}, usernames: ['afaefaef', 'fgagae']};
        expect(addAccounts(body)).toBeTrue();
    });

    it('should handle body.usernames with strings and others', function ()
    {
        const body = {group: {id: 2}, usernames: ['afaefaef', 'fgagae', 2]};
        expect(addAccounts(body)).toBeFalse();
    });
});

describe(`removeRepositories`, () =>
{
    it('should handle body without group', function ()
    {
        const body = {repositories: [{username: 'fafae', name: 'faegaeg'}, {username: 'daw', name: 'faef'}]};
        expect(removeRepositories(body)).toBeFalse();
    });

    it('should handle body.group is null', async function ()
    {
        const body = {group: null};
        expect(removeRepositories(body)).toBeFalse();
    });

    it('should handle body without repositories', function ()
    {
        const body = {group: {id: 2}};
        expect(removeRepositories(body)).toBeFalse();
    });

    it('should handle body.repositories is null', async function ()
    {
        const body = {group: {id: 2}, repositories: null};
        expect(removeRepositories(body)).toBeFalse();
    });

    it('should handle body.group with id (not number)', function ()
    {
        const body = {
            group: {id: '2'},
            repositories: [{username: 'fafae', name: 'faegaeg'}, {username: 'daw', name: 'faef'}],
        };
        expect(removeRepositories(body)).toBeFalse();
    });

    it('should handle body.group with id (number)', function ()
    {
        const body = {
            group: {id: 2},
            repositories: [{username: 'fafae', name: 'faegaeg'}, {username: 'daw', name: 'faef'}],
        };
        expect(removeRepositories(body)).toBeTrue();
    });

    it('should handle body.repositories with right content', function ()
    {
        const body = {
            group: {id: 2},
            repositories: [{username: 'fafae', name: 'faegaeg'}, {username: 'daw', name: 'faef'}],
        };
        expect(removeRepositories(body)).toBeTrue();
    });

    it('should handle body.repositories with wrong content (username)', function ()
    {
        const body = {
            group: {id: 2},
            repositories: [
                {username: 'fafae', name: 'faegaeg'},
                {username: 'daw', name: 'faef'},
                {username: 5, name: 'aegaegae'}],
        };
        expect(removeRepositories(body)).toBeFalse();
    });

    it('should handle body.repositories with wrong content (mame)', function ()
    {
        const body = {
            group: {id: 2},
            repositories: [
                {username: 'fafae', name: 'faegaeg'},
                {username: 'daw', name: 'faef'},
                {username: 'daw', name: 2}],
        };
        expect(removeRepositories(body)).toBeFalse();
    });
});