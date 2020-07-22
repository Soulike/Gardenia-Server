import {Repository, RepositoryRepository} from '../../Class';
import pool from '../Pool';
import {executeTransaction, generateColumnNamesAndValuesArrayAndParameterString} from '../Function';
import {PULL_REQUEST_STATUS} from '../../CONSTANT';
import {selectByUsernameAndName} from '../Table/Repository';

/**
 * @description 对仓库做逻辑上的删除，连带和其他表相关的操作
 * */
export async function markRepositoryDeletedByUsernameAndName(repository: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        const {username, name} = repository;
        await executeTransaction(client, async client =>
        {
            await Promise.all([
                // 标记删除
                client.query(`UPDATE
                                  repositories
                              SET "deleted"= TRUE
                              WHERE "username" = $1
                                AND "name" = $2`, [username, name]),
                // 删除 fork
                client.query(`DELETE
                              FROM forks
                              WHERE ("sourceRepositoryName" = $1
                                  AND "sourceRepositoryName" = $2)
                                 OR ("targetRepositoryUsername" = $1
                                  AND "targetRepositoryName" = $2)`, [username, name]),
                // 删除 star
                client.query(`DELETE
                              FROM stars
                              WHERE "repositoryUsername" = $1
                                AND "repositoryName" = $2`, [username, name]),
                // 删除关联合作者
                client.query(`DELETE
                              FROM collaborates
                              WHERE "repositoryUsername" = $1
                                AND "repositoryName" = $2`, [username, name]),
                // 删除关联小组关系
                client.query(`DELETE
                              FROM repository_group
                              WHERE "repositoryUsername" = $1
                                AND "repositoryName" = $2`, [username, name]),
                // 关闭相关 PR
                client.query(`UPDATE "pull-requests"
                              SET status=$1
                              WHERE (("sourceRepositoryUsername" = $2
                                  AND "sourceRepositoryName" = $3)
                                  OR ("targetRepositoryUsername" = $2
                                      AND "targetRepositoryName" = $3))
                                AND status = $4`,
                    [PULL_REQUEST_STATUS.CLOSED, username, name, PULL_REQUEST_STATUS.OPEN]),
            ]);
        });
    }
    finally
    {
        client.release();
    }
}

export async function forkRepository(sourceRepository: Readonly<Pick<Repository, 'username' | 'name'>>, targetRepository: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<void>
{
    const client = await pool.connect();
    try
    {
        await executeTransaction(client, async client =>
        {
            const sourceRepositoryInDatabase = await selectByUsernameAndName(sourceRepository);
            const {
                values: repositoryValues,
                columnNames: repositoryColumnNames,
                parameterString: repositoryParameterString,
            } = generateColumnNamesAndValuesArrayAndParameterString({
                ...sourceRepositoryInDatabase,
                username: targetRepository.username,
                name: targetRepository.name,
            });
            await client.query(`INSERT INTO repositories (${repositoryColumnNames}) VALUES (${repositoryParameterString})`, repositoryValues);

            const repositoryRepository = new RepositoryRepository(
                sourceRepository.username, sourceRepository.name,
                targetRepository.username, targetRepository.name,
            );
            const {
                values: forkValues,
                columnNames: forkColumnNames,
                parameterString: forkParameterString,
            } = generateColumnNamesAndValuesArrayAndParameterString(repositoryRepository);
            await client.query(`INSERT INTO forks (${forkColumnNames}) VALUES (${forkParameterString})`, forkValues);
        });
    }
    finally
    {
        client.release();
    }
}