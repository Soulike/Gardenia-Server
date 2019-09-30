import os from 'os';
import path from 'path';

export const GIT = {
    ROOT: path.join(os.homedir(), 'git'),   // 所有仓库的存放地
    WEBDAV_PORT: 4007,                      // Git 服务器的监听地址
};