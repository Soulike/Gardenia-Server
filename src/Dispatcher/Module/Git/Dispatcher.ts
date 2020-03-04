import Router from '@koa/router';
import {IContext, IState} from '../../Interface';
import {ADVERTISE, FILE, RPC} from './ROUTE';
import {advertise, file, rpc} from './Middleware';

export default (router: Router<IState, IContext>) =>
{
    router.get(ADVERTISE, advertise())
        .post(RPC, rpc())
        .get(FILE, file());
}