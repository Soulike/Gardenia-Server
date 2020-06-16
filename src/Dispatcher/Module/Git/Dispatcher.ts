import {IDispatcher} from '../../Interface';
import {ADVERTISE, FILE, RPC} from './ROUTE';
import {advertise, file, rpc} from './Middleware';

export default (router =>
{
    router
        .get(ADVERTISE, advertise())
        .post(RPC, rpc())
        .get(FILE, file());
}) as IDispatcher;