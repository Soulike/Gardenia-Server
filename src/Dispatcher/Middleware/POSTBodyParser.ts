import {IRouteHandler} from '../Interface';
import koaBody, {IKoaBodyOptions} from 'koa-body';
import {WrongParameterError} from '../Class';

const middlewareWrapper: IRouteHandler = () =>
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