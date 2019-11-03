import {Session} from 'koa-session';

export function isValid(session: Readonly<Session | null>): boolean
{
    return session !== null && typeof session.username === 'string';
}

export function isRequestedBySessionOwner(session: Readonly<Session | null>, username: string): boolean
{
    return session !== null && username === session.username;
}