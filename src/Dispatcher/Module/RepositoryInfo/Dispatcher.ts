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
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import bodyParser from '../../Middleware/bodyParser';
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
    router.get(REPOSITORY, JSONQuerystringParser(), repository());
    router.get(BRANCH, JSONQuerystringParser(), branch());
    router.get(LAST_COMMIT, JSONQuerystringParser(), lastCommit());
    router.get(DIRECTORY, JSONQuerystringParser(), directory());
    router.get(COMMIT_COUNT, JSONQuerystringParser(), commitCount());
    router.get(FILE_INFO, JSONQuerystringParser(), fileInfo());
    router.get(RAW_FILE, JSONQuerystringParser(), rawFile());
    router.post(SET_NAME, bodyParser(), setName());
    router.post(SET_DESCRIPTION, bodyParser(), setDescription());
    router.post(SET_IS_PUBLIC, bodyParser(), setIsPublic());
    router.get(GROUPS, JSONQuerystringParser(), groups());
    router.post(ADD_TO_GROUP, bodyParser(), addToGroup());
};