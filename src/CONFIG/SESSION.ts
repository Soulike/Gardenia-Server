import session from 'koa-session';

export const SESSION: Partial<session.opts> = {
    key: 'sess',
    renew: true,
    signed: false,
};