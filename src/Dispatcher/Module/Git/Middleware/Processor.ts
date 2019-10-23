import privateRepositoryJudge from './PrivateRepositoryJudge';
import {IRouteHandler} from '../../../Interface';

const middlewareWrapper: IRouteHandler = () =>
{
    return async (ctx, next) =>
    {
        await privateRepositoryJudge()(ctx, next);
    };
};

export default middlewareWrapper;