import Router from '@koa/router';
import {
    ADD_TO_GROUP,
    BRANCH_NAMES,
    BRANCHES,
    COMMIT,
    COMMIT_COUNT,
    COMMIT_COUNT_BETWEEN_COMMITS,
    COMMIT_DIFF,
    COMMIT_DIFF_AMOUNT,
    COMMIT_HISTORY,
    COMMIT_HISTORY_BETWEEN_COMMITS,
    DIFF_AMOUNT_BETWEEN_COMMITS,
    DIFF_BETWEEN_COMMITS,
    DIRECTORY,
    FILE_COMMIT,
    FILE_COMMIT_HISTORY,
    FILE_COMMIT_HISTORY_BETWEEN_COMMITS,
    FILE_DIFF_BETWEEN_COMMITS,
    FILE_INFO,
    FORK_AMOUNT,
    FORK_COMMIT_AMOUNT,
    FORK_COMMIT_HISTORY,
    FORK_FILE_DIFF,
    FORK_FILE_DIFF_AMOUNT,
    FORK_FROM,
    FORK_REPOSITORIES,
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
    branches,
    branchNames,
    commit,
    commitCount,
    commitCountBetweenCommits,
    commitDiff,
    commitDiffAmount,
    commitHistory,
    commitHistoryBetweenCommits,
    diffAmountBetweenCommits,
    diffBetweenCommits,
    directory,
    fileCommit,
    fileCommitHistory,
    fileCommitHistoryBetweenCommits,
    fileDiffBetweenCommits,
    fileInfo,
    forkAmount,
    forkCommitAmount,
    forkCommitHistory,
    forkFileDiff,
    forkFileDiffAmount,
    forkFrom,
    forkRepositories,
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
        .get(BRANCHES, JSONQuerystringParser(), branches())
        .get(BRANCH_NAMES, JSONQuerystringParser(), branchNames())
        .get(LAST_COMMIT, JSONQuerystringParser(), lastCommit())
        .get(DIRECTORY, JSONQuerystringParser(), directory())
        .get(COMMIT_COUNT, JSONQuerystringParser(), commitCount())
        .get(COMMIT_COUNT_BETWEEN_COMMITS, JSONQuerystringParser(), commitCountBetweenCommits())
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
        .get(DIFF_BETWEEN_COMMITS, JSONQuerystringParser(), diffBetweenCommits())
        .get(DIFF_AMOUNT_BETWEEN_COMMITS, JSONQuerystringParser(), diffAmountBetweenCommits())
        .get(FILE_DIFF_BETWEEN_COMMITS, JSONQuerystringParser(), fileDiffBetweenCommits())
        .get(COMMIT, JSONQuerystringParser(), commit())
        .get(COMMIT_DIFF, JSONQuerystringParser(), commitDiff())
        .get(COMMIT_DIFF_AMOUNT, JSONQuerystringParser(), commitDiffAmount())
        .get(FILE_COMMIT, JSONQuerystringParser(), fileCommit())
        .get(FORK_AMOUNT, JSONQuerystringParser(), forkAmount())
        .get(FORK_REPOSITORIES, JSONQuerystringParser(), forkRepositories())
        .get(FORK_FROM, JSONQuerystringParser(), forkFrom())
        .get(FORK_COMMIT_HISTORY, JSONQuerystringParser(), forkCommitHistory())
        .get(FORK_COMMIT_AMOUNT, JSONQuerystringParser(), forkCommitAmount())
        .get(FORK_FILE_DIFF, JSONQuerystringParser(), forkFileDiff())
        .get(FORK_FILE_DIFF_AMOUNT, JSONQuerystringParser(), forkFileDiffAmount());
};