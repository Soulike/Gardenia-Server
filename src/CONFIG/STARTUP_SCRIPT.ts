/**
 * @description 在服务器启动时一起执行的命令，主要是配置外部环境的参数
 * */

export const STARTUP_SCRIPT = Object.freeze([
    'git config --global core.quotepath false', // 禁止转义非 ASCII 字符，否则中文文件名会出错
]);