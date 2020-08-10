import {
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
    HAS_COMMON_ANCESTOR,
    LAST_BRANCH_COMMIT,
    LAST_COMMIT,
    RAW_FILE,
    REPOSITORY,
    SET_DESCRIPTION,
    SET_IS_PUBLIC,
    SET_NAME,
    TAG_NAMES,
} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import bodyParser from '../../Middleware/bodyParser';
import {
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
    hasCommonAncestor,
    lastBranchCommit,
    lastCommit,
    rawFile,
    repository,
    setDescription,
    setIsPublic,
    setName,
    tagNames,
} from './Middleware';
import {IDispatcher} from '../../Interface';
import sessionChecker from '../../Middleware/sessionChecker';
import * as ParameterValidator from './ParameterValidator';

export default (router =>
{
    router.get(REPOSITORY, JSONQuerystringParser(), ParameterValidator.repository(), repository())
        .get(BRANCHES, JSONQuerystringParser(), ParameterValidator.branches(), branches())
        .get(BRANCH_NAMES, JSONQuerystringParser(), ParameterValidator.branchNames(), branchNames())
        .get(TAG_NAMES, JSONQuerystringParser(), ParameterValidator.tagNames(), tagNames())
        .get(LAST_BRANCH_COMMIT, JSONQuerystringParser(), ParameterValidator.lastBranchCommit(), lastBranchCommit())
        .get(LAST_COMMIT, JSONQuerystringParser(), ParameterValidator.lastCommit(), lastCommit())
        .get(DIRECTORY, JSONQuerystringParser(), ParameterValidator.directory(), directory())
        .get(COMMIT_COUNT, JSONQuerystringParser(), ParameterValidator.commitCount(), commitCount())
        .get(COMMIT_COUNT_BETWEEN_COMMITS, JSONQuerystringParser(), ParameterValidator.commitCountBetweenCommits(), commitCountBetweenCommits())
        .get(FILE_INFO, JSONQuerystringParser(), ParameterValidator.fileInfo(), fileInfo())
        .get(RAW_FILE, JSONQuerystringParser(), ParameterValidator.rawFile(), rawFile())
        .post(SET_NAME, sessionChecker(), bodyParser(), ParameterValidator.setName(), setName())
        .post(SET_DESCRIPTION, sessionChecker(), bodyParser(), ParameterValidator.setDescription(), setDescription())
        .post(SET_IS_PUBLIC, sessionChecker(), bodyParser(), ParameterValidator.setIsPublic(), setIsPublic())
        .get(COMMIT_HISTORY_BETWEEN_COMMITS, JSONQuerystringParser(), ParameterValidator.commitHistoryBetweenCommits(), commitHistoryBetweenCommits())
        .get(COMMIT_HISTORY, JSONQuerystringParser(), ParameterValidator.commitHistory(), commitHistory())
        .get(FILE_COMMIT_HISTORY_BETWEEN_COMMITS, JSONQuerystringParser(), ParameterValidator.fileCommitHistoryBetweenCommits(), fileCommitHistoryBetweenCommits())
        .get(FILE_COMMIT_HISTORY, JSONQuerystringParser(), ParameterValidator.fileCommitHistory(), fileCommitHistory())
        .get(DIFF_BETWEEN_COMMITS, JSONQuerystringParser(), ParameterValidator.diffAmountBetweenCommits(), diffBetweenCommits())
        .get(DIFF_AMOUNT_BETWEEN_COMMITS, JSONQuerystringParser(), ParameterValidator.diffAmountBetweenCommits(), diffAmountBetweenCommits())
        .get(FILE_DIFF_BETWEEN_COMMITS, JSONQuerystringParser(), ParameterValidator.fileDiffBetweenCommits(), fileDiffBetweenCommits())
        .get(COMMIT, JSONQuerystringParser(), ParameterValidator.commit(), commit())
        .get(COMMIT_DIFF, JSONQuerystringParser(), ParameterValidator.commitDiff(), commitDiff())
        .get(COMMIT_DIFF_AMOUNT, JSONQuerystringParser(), ParameterValidator.commitDiffAmount(), commitDiffAmount())
        .get(FILE_COMMIT, JSONQuerystringParser(), ParameterValidator.fileCommit(), fileCommit())
        .get(FORK_AMOUNT, JSONQuerystringParser(), ParameterValidator.forkAmount(), forkAmount())
        .get(FORK_REPOSITORIES, JSONQuerystringParser(), ParameterValidator.forkRepositories(), forkRepositories())
        .get(FORK_FROM, JSONQuerystringParser(), ParameterValidator.forkFrom(), forkFrom())
        .get(FORK_COMMIT_HISTORY, JSONQuerystringParser(), ParameterValidator.forkCommitHistory(), forkCommitHistory())
        .get(FORK_COMMIT_AMOUNT, JSONQuerystringParser(), ParameterValidator.forkCommitAmount(), forkCommitAmount())
        .get(FORK_FILE_DIFF, JSONQuerystringParser(), ParameterValidator.forkFileDiff(), forkFileDiff())
        .get(FORK_FILE_DIFF_AMOUNT, JSONQuerystringParser(), ParameterValidator.forkFileDiffAmount(), forkFileDiffAmount())
        .get(HAS_COMMON_ANCESTOR, JSONQuerystringParser(), ParameterValidator.hasCommonAncestor(), hasCommonAncestor());
}) as IDispatcher;