import signale from 'signale';
import path from 'path';
import os from 'os';

export const SERVER = Object.freeze({
    PORT: 4006,
    ERROR_LOGGER: signale.error,
    WARN_LOGGER: signale.warn,
    INFO_LOGGER: signale.info,
    SUCCESS_LOGGER: signale.success,
    STATIC_FILE_PATH: path.join(os.homedir(), '.gardenia'),
});
