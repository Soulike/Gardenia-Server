import Router from '@koa/router';
import {
    ADD_TO_GROUP,
    BRANCH,
    COMMIT_COUNT,
    DIRECTORY,
    FILE_INFO,
    GROUPS,
    LAST_COMMIT,
    RAW_FILE,
    REPOSITORY,
    SET_DESCRIPTION,
    SET_IS_PUBLIC,
    SET_NAME,
} from './ROUTE';
import JSONQueryParameterParser from '../../Middleware/JSONQueryParameterParser';
import POSTBodyParser from '../../Middleware/POSTBodyParser';
import {
    addToGroup,
    branch,
    commitCount,
    directory,
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
    router.get(REPOSITORY, JSONQueryParameterParser(), repository());
    router.get(BRANCH, JSONQueryParameterParser(), branch());
    router.get(LAST_COMMIT, JSONQueryParameterParser(), lastCommit());
    router.get(DIRECTORY, JSONQueryParameterParser(), directory());
    router.get(COMMIT_COUNT, JSONQueryParameterParser(), commitCount());
    router.get(FILE_INFO, JSONQueryParameterParser(), fileInfo());
    router.get(RAW_FILE, JSONQueryParameterParser(), rawFile());
    router.post(SET_NAME, POSTBodyParser(), setName());
    router.post(SET_DESCRIPTION, POSTBodyParser(), setDescription());
    router.post(SET_IS_PUBLIC, POSTBodyParser(), setIsPublic());
    router.get(GROUPS, JSONQueryParameterParser(), groups());
    router.post(ADD_TO_GROUP, POSTBodyParser(), addToGroup());
};