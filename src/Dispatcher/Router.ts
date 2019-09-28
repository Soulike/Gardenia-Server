import Router from '@koa/router';
import accountDispatcher from './Account';
import repositoryDispatcher from './Repository';
import repositoryInfoDispatcher from './RepositoryInfo';
import profileDispatcher from './Profile';

const router = new Router({
    prefix: '/server',
});

// 在此注入 router 到各个 dispatcher
accountDispatcher(router);
repositoryDispatcher(router);
repositoryInfoDispatcher(router);
profileDispatcher(router);

export {router};