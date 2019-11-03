import signale from 'signale';

export const SERVER = Object.freeze({
    PORT: 4006,
    ERROR_LOGGER: signale.error,
    WARN_LOGGER: signale.warn,
    INFO_LOGGER: signale.info,
    SUCCESS_LOGGER: signale.success,
});
