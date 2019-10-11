import privateRepositoryJudge from './PrivateRepositoryJudge';
import {MiddlewareWrapper} from '../../../Interface';

const middlewareWrapper: MiddlewareWrapper = () =>
{
    return async (ctx, next) =>
    {
        await privateRepositoryJudge()(ctx, next);
    };
};

export default middlewareWrapper;