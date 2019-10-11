import {MiddlewareWrapper} from '../Interface';
import koaBody, {IKoaBodyOptions} from 'koa-body';
import {WrongParameterError} from '../Class';

const middlewareWrapper: MiddlewareWrapper = () =>
{
    return koaBody({
        multipart: true,
        onError: () =>
        {
            throw new WrongParameterError();
        },
    } as IKoaBodyOptions);
};

export default middlewareWrapper;