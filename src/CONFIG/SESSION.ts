import session from 'koa-session';

export const SESSION: Readonly<Partial<session.opts>> = Object.freeze({
    key: 'sess',
    renew: true,
    signed: false,
});