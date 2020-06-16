import {IDispatcher} from '../../Interface';
import {ADD, DEL, GET, UPDATE} from './ROUTE';
import bodyParser from '../../Middleware/bodyParser';
import {add, del, get, update} from './Middleware';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import sessionChecker from '../../Middleware/sessionChecker';
import * as ParameterValidator from './ParameterValidator';

export default (router =>
{
    router
        .post(ADD, sessionChecker(), bodyParser(), ParameterValidator.add(), add())
        .post(DEL, sessionChecker(), bodyParser(), ParameterValidator.del(), del())
        .get(GET, JSONQuerystringParser(), ParameterValidator.get(), get())
        .post(UPDATE, sessionChecker(), bodyParser(), ParameterValidator.update(), update());
}) as IDispatcher;