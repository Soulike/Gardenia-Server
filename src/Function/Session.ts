import {ISession} from '../Interface';

export function isSessionValid(session: Readonly<ISession>): boolean
{
    return typeof session.username === 'string';
}