import Router from '@koa/router';
import accountDispatcher from './Module/Account';
import repositoryDispatcher from './Module/Repository';
import repositoryInfoDispatcher from './Module/RepositoryInfo';
import profileDispatcher from './Module/Profile';
import gitDispatcher from './Module/Git';
import groupDispatcher from './Module/Group';
import starDispatcher from './Module/Star';
import http from 'http';
import {IContext, IState} from './Interface';

const router = new Router<IState, IContext>({
    methods: http.METHODS,
});

// 在此注入 router 到各个 dispatcher
accountDispatcher(router);
repositoryDispatcher(router);
repositoryInfoDispatcher(router);
profileDispatcher(router);
gitDispatcher(router);
groupDispatcher(router);
starDispatcher(router);

export default router;