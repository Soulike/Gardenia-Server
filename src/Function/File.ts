import {execPromise} from './Promisify';
import * as String from './String';

export async function isBinaryFile(filePath: string): Promise<boolean>
{
    const stdout = (await execPromise(`file ${String.escapeLiteral(filePath)}`)).toLowerCase();
    return !(stdout.includes('text') || stdout.includes('json') || stdout.includes('svg'));
}