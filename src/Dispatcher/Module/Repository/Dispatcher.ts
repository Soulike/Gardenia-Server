import {CREATE, DEL, FORK, GET_REPOSITORIES, IS_MERGEABLE, SEARCH, SHOULD_SHOW_OPTIONS} from './ROUTE';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import {create, del, fork, getRepositories, isMergeable, search, shouldShowOptions} from './Middleware';
import bodyParser from '../../Middleware/bodyParser';
import {IDispatcher} from '../../Interface';
import sessionChecker from '../../Middleware/sessionChecker';
import * as ParameterValidator from './ParameterValidator';
import rateLimiter from '../../Middleware/rateLimiter';

export default (router =>
{
    router.post(CREATE, sessionChecker(), bodyParser(), ParameterValidator.create(), create())
        .post(DEL, sessionChecker(), bodyParser(), ParameterValidator.del(), del())
        .get(GET_REPOSITORIES, JSONQuerystringParser(), ParameterValidator.getRepositories(), getRepositories())
        .post(FORK, sessionChecker(), bodyParser(), ParameterValidator.fork(), fork())
        .get(IS_MERGEABLE, JSONQuerystringParser(), ParameterValidator.isMergeable(), isMergeable())
        .post(SEARCH, rateLimiter(120), bodyParser(), ParameterValidator.search(), search())
        .get(SHOULD_SHOW_OPTIONS, JSONQuerystringParser(), ParameterValidator.shouldShowOptions(), shouldShowOptions());
}) as IDispatcher;