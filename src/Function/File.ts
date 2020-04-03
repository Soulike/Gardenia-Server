import {execPromise} from './Promisify';

export async function isBinaryFile(filePath: string): Promise<boolean>
{
    const stdout = (await execPromise(`file '${filePath}'`)).toLowerCase();
    return !(stdout.includes('text') || stdout.includes('json') || stdout.includes('svg'));
}