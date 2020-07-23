import session from 'koa-session';
import {Session} from '../RAMDatabase';

export const SESSION: Readonly<Partial<session.opts>> = Object.freeze({
    key: 'gardenia-session-key',
    renew: true,
    signed: false,
    store: {
        get: Session.get,
        set: Session.set,
        destroy: Session.destroy,
    },
});