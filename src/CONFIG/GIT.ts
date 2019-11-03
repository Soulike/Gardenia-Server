import os from 'os';
import path from 'path';

export const GIT = Object.freeze({
    ROOT: path.join(os.homedir(), 'git'),   // 所有仓库的存放地
});