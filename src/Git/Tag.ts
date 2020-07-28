import {Tag} from '../Class';
import {Promisify, String} from '../Function';
import {getCommit} from './Commit';

export async function getTagNames(repositoryPath: string): Promise<string[]>
{
    const output = await Promisify.execPromise(`git tag`, {cwd: repositoryPath});
    const tagNames = String.splitToLines(output);
    return tagNames.map(tagName => tagName.trim());
}

export async function getTagsInfo(repositoryPath: string): Promise<Tag[]>
{
    const tagOutput = await Promisify.execPromise(
        `git tag`, {cwd: repositoryPath});
    const tagLines = String.splitToLines(tagOutput);
    return await Promise.all(tagLines.map(async line =>
    {
        const tagName = line.trim();
        const commit = await getCommit(repositoryPath, tagName);
        return new Tag(tagName, commit);
    }));
}