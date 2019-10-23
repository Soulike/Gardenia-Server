import Router from '@koa/router';
import processor from './Middleware';
import {IContext, IState} from '../../Interface';

export default (router: Router<IState, IContext>) =>
{
    router.all(/\/(.+)\/(.+)\.git(?:\/(.*))/, processor());
}