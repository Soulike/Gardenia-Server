function prefix(url: string): string
{
    return `/repositoryInfo${url}`;
}

export const REPOSITORY = prefix('/repository');
export const BRANCH = prefix('/branch');
export const LAST_COMMIT = prefix('/lastCommit');
export const DIRECTORY = prefix('/directory');
export const COMMIT_COUNT = prefix('/commitCount');
export const FILE_INFO = prefix('/fileInfo');
export const RAW_FILE = prefix('/rawFile');