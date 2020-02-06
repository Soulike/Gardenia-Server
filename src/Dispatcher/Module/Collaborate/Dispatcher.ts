import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {
    ADD,
    GENERATE_CODE,
    GET_COLLABORATING_REPOSITORIES,
    GET_COLLABORATING_REPOSITORIES_AMOUNT,
    GET_COLLABORATORS,
    GET_COLLABORATORS_AMOUNT,
    REMOVE,
} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import {
    add,
    generateCode,
    getCollaboratingRepositories,
    getCollaboratingRepositoriesAmount,
    getCollaborators,
    getCollaboratorsAmount,
    remove,
} from './Middleware';
import bodyParser from '../../Middleware/bodyParser';

export default (router: Router<IState, IContext>) =>
{
    router
        .get(GENERATE_CODE, JSONQuerystringParser(), generateCode())
        .post(ADD, bodyParser(), add())
        .post(REMOVE, bodyParser(), remove())
        .get(GET_COLLABORATORS, JSONQuerystringParser(), getCollaborators())
        .get(GET_COLLABORATORS_AMOUNT, JSONQuerystringParser(), getCollaboratorsAmount())
        .get(GET_COLLABORATING_REPOSITORIES, JSONQuerystringParser(), getCollaboratingRepositories())
        .get(GET_COLLABORATING_REPOSITORIES_AMOUNT, JSONQuerystringParser(), getCollaboratingRepositoriesAmount());
}