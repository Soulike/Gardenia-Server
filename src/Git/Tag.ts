import {Promisify, String} from '../Function';

export async function getTagNames(repositoryPath: string): Promise<string[]>
{
    const output = await Promisify.execPromise(`git tag`, {cwd: repositoryPath});
    const tagNames = String.splitToLines(output);
    return tagNames.map(tagName => tagName.trim());
}