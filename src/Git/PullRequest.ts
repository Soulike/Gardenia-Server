import {Repository} from '../Class';
import {Repository as RepositoryFunction} from '../Function';
import {getBranchNames} from './Branch';
import {PullRequest as PullRequestTable} from '../Database';
import {getLastCommitHash} from './Commit';

/**
 * @description 更新与某仓库关联的所有 PR
 * */
export async function updateRelatedPullRequest(repository: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<void>
{
    const {username, name} = repository;
    // 不做仓库存在检测
    // 取出所有分支
    const repositoryPath = RepositoryFunction.generateRepositoryPath({username, name});
    const branchNames = await getBranchNames(repositoryPath);
    // 更新所有分支关联的 Pull Request
    await Promise.all(branchNames.map(async branchName =>
    {
        const pullRequests = await PullRequestTable.select({
            sourceRepositoryUsername: username,
            sourceRepositoryName: name,
            sourceRepositoryBranchName: branchName,
        });
        const lastCommitHash = await getLastCommitHash(repositoryPath, branchName);
        await Promise.all(pullRequests.map(async ({id, sourceRepositoryCommitHash}) =>
        {
            if (sourceRepositoryCommitHash !== lastCommitHash)
            {
                await PullRequestTable.update(
                    {sourceRepositoryCommitHash: lastCommitHash},
                    {id});
            }
        }));
    }));
}

