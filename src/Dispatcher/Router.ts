import Router from '@koa/router';
import accountDispatcher from './Module/Account';
import repositoryDispatcher from './Module/Repository';
import repositoryInfoDispatcher from './Module/RepositoryInfo';
import profileDispatcher from './Module/Profile';
import gitDispatcher from './Module/Git';
import http from 'http';

const router = new Router({
    methods: http.METHODS,
});

// 在此注入 router 到各个 dispatcher
accountDispatcher(router);
repositoryDispatcher(router);
repositoryInfoDispatcher(router);
profileDispatcher(router);
gitDispatcher(router);

export default router;