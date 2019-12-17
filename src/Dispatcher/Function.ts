import {Session} from 'koa-session';

export function prefix(url: string): string
{
    return `/server${url}`;
}

export function isSessionValid(session: Session): boolean
{
    const {username} = session;
    return typeof username === 'string';
}