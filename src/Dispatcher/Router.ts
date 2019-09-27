import Router from '@koa/router';
import {dispatcher as accountDispatcher} from './Account';

const router = new Router({
    prefix: '/server',
});

// 在此注入 router 到各个 dispatcher
accountDispatcher(router);

export {router};