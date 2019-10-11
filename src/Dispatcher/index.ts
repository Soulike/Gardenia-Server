import router from './Router';
import compose from 'koa-compose';
import errorProcessor from './Middleware/ErrorProcessor';
import responseFormat from './Middleware/ResponseFormat';

export default () =>
{
    return compose([
        responseFormat(),
        errorProcessor(),
        router.routes(),
        router.allowedMethods(),
    ]);
};