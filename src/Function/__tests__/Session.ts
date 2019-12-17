import {Session} from 'koa-session';
import {isRequestedBySessionOwner, isSessionValid} from '../Session';

describe(`${isSessionValid.name}`, () =>
{
    let session: Session;

    beforeEach(() =>
    {
        // stub
        session = {
            toJSON(): object {return {};},
            inspect(): object {return {};},
            length: 0,
            maxAge: 0,
            save(): void {},
            populated: false,
        };
    });

    it('should be valid when session contains valid "username" value', function ()
    {
        session.username = 'hello';
        expect(isSessionValid(session)).toBe(true);
    });

    it('should be invalid when session does not contain "username" key', function ()
    {
        expect(isSessionValid(session)).toBe(false);
    });

    it('should be invalid when session contains invalid "username" value', function ()
    {
        session.username = 2;
        expect(isSessionValid(session)).toBe(false);
    });
});

describe(`${isRequestedBySessionOwner.name}`, () =>
{
    let session: Session;
    const username = 'test';
    const wrongUsername = 'test2';

    beforeEach(() =>
    {
        // stub
        session = {
            toJSON(): object {return {};},
            inspect(): object {return {};},
            length: 0,
            maxAge: 0,
            save(): void {},
            populated: false,
        };
    });

    it('should return true when "username" is the same to session\'s', function ()
    {
        Object.assign(session, {username});
        expect(isRequestedBySessionOwner(session, username)).toBe(true);
    });

    it('should return false when "username" is different to session\'s', function ()
    {
        Object.assign(session, {username});
        expect(isRequestedBySessionOwner(session, wrongUsername)).toBe(false);
    });

    it('should return false when "username" key does not exists on session', function ()
    {
        expect(isRequestedBySessionOwner(session, username)).toBe(false);
    });
});