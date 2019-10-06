import Router from '@koa/router';
import processor from './Middleware';

export default (router: Router) =>
{
    router.all(/\/(.+)\/(.+)\.git(?:\/(.*))/, processor());
}