import {Session} from 'koa-session';

export function isSessionValid(session: Readonly<Session>): boolean
{
    return typeof session.username === 'string';
}

export function isRequestedBySessionOwner(session: Readonly<Session>, username: string): boolean
{
    return username === session.username;
}