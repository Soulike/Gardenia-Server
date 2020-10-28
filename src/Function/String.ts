const {sh} = require('puka');

export function splitToLines(string: string): string[]
{
    return string.split('\n').filter(line => line.length !== 0);
}

/**
 * @description 转义用于命令行命令中的字面量
 * */
export function escapeLiteral(literal: string): string
{
    return sh`${literal}`;
}