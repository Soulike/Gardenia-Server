import {exec} from 'child_process';
import {Commit} from '../Class';
import {Promisify} from './Promisify';

export namespace Git
{
    export async function getBranches(repositoryPath: string): Promise<Array<string>>
    {
        return new Promise((resolve, reject) =>
        {
            exec('git branch', {cwd: repositoryPath}, (error, stdout) =>
            {
                if (error)
                {
                    return reject(error);
                }
                resolve(
                    stdout
                        .split(/\s+/)
                        .slice(1)
                        .filter(branch => branch.length !== 0),
                );
            });
        });
    }

    export async function getLastCommitInfo(repositoryPath: string, branch: string): Promise<Commit>
    {
        const info = await Promise.all([
            Promisify.execPromise(`git log --pretty=format:'%H' -1 ${branch}`, {cwd: repositoryPath}),
            Promisify.execPromise(`git log --pretty=format:'%cn' -1 ${branch}`, {cwd: repositoryPath}),
            Promisify.execPromise(`git log --pretty=format:'%ce' -1 ${branch}`, {cwd: repositoryPath}),
            Promisify.execPromise(`git log --pretty=format:'%cr' -1 ${branch}`, {cwd: repositoryPath}),
            Promisify.execPromise(`git log --pretty=format:'%s' -1 ${branch}`, {cwd: repositoryPath}),
        ]) as Array<string>;

        return new Commit(info[0], info[1], info[2], info[3], info[4]);
    }
}