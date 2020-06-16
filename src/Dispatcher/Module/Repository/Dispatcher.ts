import {CREATE, DEL, FORK, GET_REPOSITORIES, IS_MERGEABLE} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import {create, del, fork, getRepositories, isMergeable} from './Middleware';
import bodyParser from '../../Middleware/bodyParser';
import {IDispatcher} from '../../Interface';
import sessionChecker from '../../Middleware/sessionChecker';
import * as ParameterValidator from './ParameterValidator';

export default (router =>
{
    router.post(CREATE, sessionChecker(), bodyParser(), ParameterValidator.create(), create())
        .post(DEL, sessionChecker(), bodyParser(), ParameterValidator.del(), del())
        .get(GET_REPOSITORIES, JSONQuerystringParser(), ParameterValidator.getRepositories(), getRepositories())
        .post(FORK, sessionChecker(), bodyParser(), ParameterValidator.fork(), fork())
        .get(IS_MERGEABLE, JSONQuerystringParser(), ParameterValidator.isMergeable(), isMergeable());
}) as IDispatcher;