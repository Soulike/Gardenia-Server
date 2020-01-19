import {IRouteHandler} from '../Interface';
import koaBody, {IKoaBodyOptions} from 'koa-body';
import {WrongParameterError} from '../Class';

const bodyParser: IRouteHandler = () => koaBody({
    multipart: true,
    formidable: {hash: 'md5'},
    onError: () =>
    {
        throw new WrongParameterError();
    },
} as IKoaBodyOptions);

export default bodyParser;