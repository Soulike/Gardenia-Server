import router from './Router';
import compose from 'koa-compose';
import errorHandler from './Middleware/errorHandler';
import responseHandler from './Middleware/responseHandler';
import * as Interface from './Interface';

export default () =>
{
    return compose([
        responseHandler(),
        errorHandler(),
        router.routes(),
        router.allowedMethods(),
    ]);
};

export {Interface};