import {exec, ExecOptions} from 'child_process';

export namespace Promisify
{
    export async function execPromise(command: string, options?: ExecOptions): Promise<string | Buffer>
    {
        return new Promise<string | Buffer>((resolve, reject) =>
        {
            exec(command, options, (error, stdout) =>
            {
                if (error)
                {
                    return reject(error);
                }
                return resolve(stdout);
            });
        });
    }
}