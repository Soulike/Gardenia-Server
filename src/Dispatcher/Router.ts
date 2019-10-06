import Router from '@koa/router';
import accountDispatcher from './Account';
import repositoryDispatcher from './Repository';
import repositoryInfoDispatcher from './RepositoryInfo';
import profileDispatcher from './Profile';
import gitDispatcher from './Git';
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