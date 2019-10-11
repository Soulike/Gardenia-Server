import Router from '@koa/router';
import {BRANCH, COMMIT_COUNT, DIRECTORY, FILE_INFO, LAST_COMMIT, RAW_FILE, REPOSITORY} from './ROUTE';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import {branch, commitCount, directory, fileInfo, lastCommit, rawFile, repository} from './Middleware';

export default (router: Router) =>
{
    router.get(REPOSITORY, JSONQueryParameterParser(), repository());
    router.get(BRANCH, JSONQueryParameterParser(), branch());
    router.get(LAST_COMMIT, JSONQueryParameterParser(), lastCommit());
    router.get(DIRECTORY, JSONQueryParameterParser(), directory());
    router.get(COMMIT_COUNT, JSONQueryParameterParser(), commitCount());
    router.get(FILE_INFO, JSONQueryParameterParser(), fileInfo());
    router.get(RAW_FILE, JSONQueryParameterParser(), rawFile());
};