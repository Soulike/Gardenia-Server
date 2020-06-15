import {IDispatcher} from '../../Interface';
import {
    ADD,
    GET_REPOSITORY_STAR_AMOUNT,
    GET_REPOSITORY_STAR_USERS,
    GET_STARED_REPOSITORIES,
    GET_STARED_REPOSITORIES_AMOUNT,
    IS_STARED_REPOSITORY,
    REMOVE,
} from './ROUTE';
import bodyParser from '../../Middleware/bodyParser';
import {
    add,
    getRepositoryStarAmount,
    getRepositoryStarUsers,
    getStaredRepositories,
    getStaredRepositoriesAmount,
    isStaredRepository,
    remove,
} from './Middleware';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import sessionChecker from '../../Middleware/sessionChecker';

export default (router =>
{
    router
        .post(ADD, sessionChecker(), bodyParser(), add())
        .post(REMOVE, sessionChecker(), bodyParser(), remove())
        .get(GET_STARED_REPOSITORIES, JSONQuerystringParser(), getStaredRepositories())
        .get(GET_STARED_REPOSITORIES_AMOUNT, JSONQuerystringParser(), getStaredRepositoriesAmount())
        .get(IS_STARED_REPOSITORY, JSONQuerystringParser(), isStaredRepository())
        .get(GET_REPOSITORY_STAR_AMOUNT, JSONQuerystringParser(), getRepositoryStarAmount())
        .get(GET_REPOSITORY_STAR_USERS, JSONQuerystringParser(), getRepositoryStarUsers());
}) as IDispatcher;