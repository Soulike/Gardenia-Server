import Router from '@koa/router';
import {dispatcher as accountDispatcher} from './Account';
import {dispatcher as repositoryDispatcher} from './Repository';
import {dispatcher as repositoryInfoDispatcher} from './RepositoryInfo';

const router = new Router({
    prefix: '/server',
});

// 在此注入 router 到各个 dispatcher
accountDispatcher(router);
repositoryDispatcher(router);
repositoryInfoDispatcher(router);

export {router};