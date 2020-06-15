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
import * as ParameterValidator from './PatameterValidator';

export default (router =>
{
    router
        .post(ADD, sessionChecker(), bodyParser(), ParameterValidator.add(), add())
        .post(REMOVE, sessionChecker(), bodyParser(), ParameterValidator.remove(), remove())
        .get(GET_STARED_REPOSITORIES, JSONQuerystringParser(), ParameterValidator.getStaredRepositories(), getStaredRepositories())
        .get(GET_STARED_REPOSITORIES_AMOUNT, JSONQuerystringParser(), ParameterValidator.getStaredRepositoriesAmount(), getStaredRepositoriesAmount())
        .get(IS_STARED_REPOSITORY, JSONQuerystringParser(), ParameterValidator.isStaredRepository(), isStaredRepository())
        .get(GET_REPOSITORY_STAR_AMOUNT, JSONQuerystringParser(), ParameterValidator.getRepositoryStarAmount(), getRepositoryStarAmount())
        .get(GET_REPOSITORY_STAR_USERS, JSONQuerystringParser(), ParameterValidator.getRepositoryStarUsers(), getRepositoryStarUsers());
}) as IDispatcher;