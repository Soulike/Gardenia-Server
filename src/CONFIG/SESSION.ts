import session from 'koa-session';

export const SESSION: Readonly<Partial<session.opts>> = Object.freeze({
    key: 'gardenia-session-key',
    renew: true,
    signed: false,
});