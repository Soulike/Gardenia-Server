import Router from '@koa/router';
import {BRANCH, COMMIT_COUNT, DIRECTORY, FILE_INFO, LAST_COMMIT, RAW_FILE, REPOSITORY, SET_NAME} from './ROUTE';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import POSTBodyParser from '../../Middleware/POSTBodyParser';
import {branch, commitCount, directory, fileInfo, lastCommit, rawFile, repository, setName} from './Middleware';

export default (router: Router) =>
{
    router.get(REPOSITORY, JSONQueryParameterParser(), repository());
    router.get(BRANCH, JSONQueryParameterParser(), branch());
    router.get(LAST_COMMIT, JSONQueryParameterParser(), lastCommit());
    router.get(DIRECTORY, JSONQueryParameterParser(), directory());
    router.get(COMMIT_COUNT, JSONQueryParameterParser(), commitCount());
    router.get(FILE_INFO, JSONQueryParameterParser(), fileInfo());
    router.get(RAW_FILE, JSONQueryParameterParser(), rawFile());
    router.post(SET_NAME, POSTBodyParser(), setName());
};