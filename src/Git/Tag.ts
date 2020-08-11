import {Promisify, String} from '../Function';
import {Tag} from '../Class';
import {getCommit} from './Commit';

export async function getTagNames(repositoryPath: string): Promise<string[]>
{
    const output = await Promisify.execPromise(`git tag`, {cwd: repositoryPath});
    const tagNames = String.splitToLines(output);
    return tagNames.map(tagName => tagName.trim());
}

export async function getTagInfo(repositoryPath: string, tagName: string): Promise<Tag>
{
    const subject = (await Promisify.execPromise(
        `git tag -l --format='%(contents:subject)' '${tagName}'`,
        {cwd: repositoryPath})).trim();
    const body = (await Promisify.execPromise(
        `git tag -l --format='%(contents:body)' '${tagName}'`,
        {cwd: repositoryPath})).trim();
    return new Tag(tagName, {subject, body}, await getCommit(repositoryPath, tagName));
}

export async function getTagsInfo(repositoryPath: string, offset: number = 0, limit: number = Number.MAX_SAFE_INTEGER): Promise<Tag[]>
{
    const tagNames = (await getTagNames(repositoryPath)).slice(offset, offset + limit);
    return await Promise.all(tagNames.map(tagName => getTagInfo(repositoryPath, tagName)));
}