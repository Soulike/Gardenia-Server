import bodyParser from '../../Middleware/bodyParser';
import * as ParameterValidator from './ParameterValidator';
import JSONQuerystringParser from '../../Middleware/JSONQuerystringParser';
import sessionChecker from '../../Middleware/sessionChecker';
import {IDispatcher} from '../../Interface';
import {GET, GET_COUNT, SET_CONFIRMED} from './ROUTE';
import {get, getCount, setConfirmed} from './Middleware';

export default (router =>
{
    router
        .get(GET, sessionChecker(), JSONQuerystringParser(), ParameterValidator.get(), get())
        .get(GET_COUNT, sessionChecker(), JSONQuerystringParser(), ParameterValidator.getCount(), getCount())
        .post(SET_CONFIRMED, sessionChecker(), bodyParser(), ParameterValidator.setConfirmed(), setConfirmed());

}) as IDispatcher;