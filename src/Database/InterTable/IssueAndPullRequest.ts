import {Issue, PullRequest, Repository} from '../../Class';
import {generateParameterizedStatementAndValuesArray} from '../Function';
import pool from '../Pool';

/**@description 获得仓库的最大 no 号*/
export async function selectMaxNoOfRepository(repository: Readonly<Pick<Repository, 'username' | 'name'>>): Promise<number>
{
    const {username, name} = repository;
    const {parameterizedStatement: parameterizedStatementForIssue, values} =
        generateParameterizedStatementAndValuesArray(
            <Pick<Issue, 'repositoryUsername' | 'repositoryName'>>{
                repositoryUsername: username,
                repositoryName: name,
            }, 'AND');
    const {parameterizedStatement: parameterizedStatementForPullRequest} =
        generateParameterizedStatementAndValuesArray(
            <Pick<PullRequest, 'targetRepositoryUsername' | 'targetRepositoryName'>>{
                targetRepositoryUsername: username,
                targetRepositoryName: name,
            }, 'AND');
    const {rows} = await pool.query(
        `SELECT MAX(t."maxNo") AS "maxNo"
             FROM (SELECT CASE COUNT("no") WHEN 0 THEN 0 ELSE MAX("no") END AS "maxNo"
                   FROM "issues" WHERE ${parameterizedStatementForIssue}
                   UNION
                   SELECT CASE COUNT("no") WHEN 0 THEN 0 ELSE MAX("no") END AS "maxNo"
                   FROM "pull-requests" WHERE ${parameterizedStatementForPullRequest}) AS "t";`,
        values);
    return Number.parseInt(rows[0]['maxNo']);
}