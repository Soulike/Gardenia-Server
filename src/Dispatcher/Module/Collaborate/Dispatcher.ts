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
import sessionChecker from '../../Middleware/sessionChecker';
import * as ParameterValidator from './ParameterValidator';

export default (router: Router<IState, IContext>) =>
{
    router
        .get(GENERATE_CODE, sessionChecker(), JSONQuerystringParser(), ParameterValidator.generateCode(), generateCode())
        .post(ADD, sessionChecker(), bodyParser(), ParameterValidator.add(), add())
        .post(REMOVE, sessionChecker(), bodyParser(), ParameterValidator.remove(), remove())
        .get(GET_COLLABORATORS, sessionChecker(), JSONQuerystringParser(), ParameterValidator.getCollaborators(), getCollaborators())
        .get(GET_COLLABORATORS_AMOUNT, sessionChecker(), JSONQuerystringParser(), ParameterValidator.getCollaboratorsAmount(), getCollaboratorsAmount())
        .get(GET_COLLABORATING_REPOSITORIES, JSONQuerystringParser(), ParameterValidator.getCollaboratingRepositories(), getCollaboratingRepositories())
        .get(GET_COLLABORATING_REPOSITORIES_AMOUNT, JSONQuerystringParser(), ParameterValidator.getCollaboratingRepositoriesAmount(), getCollaboratingRepositoriesAmount());
}