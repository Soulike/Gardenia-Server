import Router from '@koa/router';
import {
    ADD_TO_GROUP,
    BRANCH,
    COMMIT_COUNT,
    COMMIT_HISTORY,
    COMMIT_HISTORY_BETWEEN_COMMITS,
    DIFF,
    DIRECTORY,
    FILE_COMMIT_HISTORY,
    FILE_COMMIT_HISTORY_BETWEEN_COMMITS,
    FILE_DIFF,
    FILE_INFO,
    GROUPS,
    LAST_COMMIT,
    RAW_FILE,
    REPOSITORY,
    SET_DESCRIPTION,
    SET_IS_PUBLIC,
    SET_NAME,
} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import bodyParser from '../../Middleware/bodyParser';
import {
    addToGroup,
    branch,
    commitCount,
    commitHistory,
    commitHistoryBetweenCommits,
    diff,
    directory,
    fileCommitHistory,
    fileCommitHistoryBetweenCommits,
    fileDiff,
    fileInfo,
    groups,
    lastCommit,
    rawFile,
    repository,
    setDescription,
    setIsPublic,
    setName,
} from './Middleware';
import {IContext, IState} from '../../Interface';

export default (router: Router<IState, IContext>) =>
{
    router.get(REPOSITORY, JSONQuerystringParser(), repository())
        .get(BRANCH, JSONQuerystringParser(), branch())
        .get(LAST_COMMIT, JSONQuerystringParser(), lastCommit())
        .get(DIRECTORY, JSONQuerystringParser(), directory())
        .get(COMMIT_COUNT, JSONQuerystringParser(), commitCount())
        .get(FILE_INFO, JSONQuerystringParser(), fileInfo())
        .get(RAW_FILE, JSONQuerystringParser(), rawFile())
        .post(SET_NAME, bodyParser(), setName())
        .post(SET_DESCRIPTION, bodyParser(), setDescription())
        .post(SET_IS_PUBLIC, bodyParser(), setIsPublic())
        .get(GROUPS, JSONQuerystringParser(), groups())
        .post(ADD_TO_GROUP, bodyParser(), addToGroup())
        .get(COMMIT_HISTORY_BETWEEN_COMMITS, JSONQuerystringParser(), commitHistoryBetweenCommits())
        .get(COMMIT_HISTORY, JSONQuerystringParser(), commitHistory())
        .get(FILE_COMMIT_HISTORY_BETWEEN_COMMITS, JSONQuerystringParser(), fileCommitHistoryBetweenCommits())
        .get(FILE_COMMIT_HISTORY, JSONQuerystringParser(), fileCommitHistory())
        .get(DIFF, JSONQuerystringParser(), diff())
        .get(FILE_DIFF, JSONQuerystringParser(), fileDiff());
};