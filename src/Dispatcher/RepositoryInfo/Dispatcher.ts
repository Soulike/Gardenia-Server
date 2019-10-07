import Router from '@koa/router';
import {BRANCH, COMMIT_COUNT, DIRECTORY, FILE_INFO, LAST_COMMIT, RAW_FILE, REPOSITORY} from './ROUTE';
import {ResponseBody} from '../../Class';
import {RepositoryInfo} from '../../Service';
import JSONQueryParameterParser from '../Middleware/JSONQueryParameterParser';

export default (router: Router) =>
{
    router.get(REPOSITORY, JSONQueryParameterParser(), async (ctx) =>
    {
        const {username, name} = ctx.request.body;
        if (typeof username !== 'string' || typeof name !== 'string')
        {
            ctx.response.status = 400;
            ctx.response.body = new ResponseBody(false, '请求参数错误');
            return;
        }
        const {statusCode, headers, body} = await RepositoryInfo.repository(username, name, ctx.session);
        if (headers)
        {
            ctx.response.set(headers);
        }
        ctx.response.body = body;
        ctx.response.status = statusCode;
    });

    router.get(BRANCH, JSONQueryParameterParser(), async (ctx) =>
    {
        const {username, name} = ctx.request.body;
        if (typeof username !== 'string' || typeof name !== 'string')
        {
            ctx.response.status = 400;
            ctx.response.body = new ResponseBody(false, '请求参数错误');
            return;
        }
        const {statusCode, headers, body} = await RepositoryInfo.branch(username, name, ctx.session);
        if (headers)
        {
            ctx.response.set(headers);
        }
        ctx.response.body = body;
        ctx.response.status = statusCode;
    });

    router.get(LAST_COMMIT, JSONQueryParameterParser(), async (ctx) =>
    {
        const {username, name, branch, file} = ctx.request.body;
        if (
            typeof username !== 'string' ||
            typeof name !== 'string' ||
            typeof branch !== 'string' ||
            (typeof file !== 'undefined' && typeof file !== 'string'))
        {
            ctx.response.status = 400;
            ctx.response.body = new ResponseBody(false, '请求参数错误');
            return;
        }
        const {statusCode, headers, body} = await RepositoryInfo.lastCommit(username, name, branch, ctx.session, file);
        if (headers)
        {
            ctx.response.set(headers);
        }
        ctx.response.body = body;
        ctx.response.status = statusCode;
    });

    router.get(DIRECTORY, JSONQueryParameterParser(), async (ctx) =>
    {
        const {username, name, branch, path} = ctx.request.body;
        if (typeof username !== 'string' || typeof name !== 'string' || typeof branch !== 'string' || typeof path !== 'string')
        {
            ctx.response.status = 400;
            ctx.response.body = new ResponseBody(false, '请求参数错误');
            return;
        }
        const {statusCode, headers, body} = await RepositoryInfo.directory(username, name, branch, path, ctx.session);
        if (headers)
        {
            ctx.response.set(headers);
        }
        ctx.response.body = body;
        ctx.response.status = statusCode;
    });

    router.get(COMMIT_COUNT, JSONQueryParameterParser(), async (ctx) =>
    {
        const {username, name, branch} = ctx.request.body;
        if (typeof username !== 'string' ||
            typeof name !== 'string' ||
            typeof branch !== 'string')
        {
            ctx.response.status = 400;
            ctx.response.body = new ResponseBody(false, '请求参数错误');
            return;
        }
        const {statusCode, headers, body} = await RepositoryInfo.commitCount(username, name, branch, ctx.session);
        if (headers)
        {
            ctx.response.set(headers);
        }
        ctx.response.body = body;
        ctx.response.status = statusCode;
    });

    router.get(FILE_INFO, JSONQueryParameterParser(), async (ctx) =>
    {
        const {username, repositoryName, filePath, commitHash} = ctx.request.body;
        if (typeof username !== 'string' ||
            typeof repositoryName !== 'string' ||
            typeof filePath !== 'string' ||
            typeof commitHash !== 'string')
        {
            ctx.response.status = 400;
            ctx.response.body = new ResponseBody(false, '请求参数错误');
            return;
        }

        const {statusCode, headers, body} = await RepositoryInfo.fileInfo(username, repositoryName, filePath, commitHash, ctx.session);
        if (headers)
        {
            ctx.response.set(headers);
        }
        ctx.response.body = body;
        ctx.response.status = statusCode;
    });

    router.get(RAW_FILE, JSONQueryParameterParser(), async (ctx) =>
    {
        const {username, repositoryName, filePath, commitHash} = ctx.request.body;
        if (typeof username !== 'string' ||
            typeof repositoryName !== 'string' ||
            typeof filePath !== 'string' ||
            typeof commitHash !== 'string')
        {
            ctx.response.status = 400;
            ctx.response.body = new ResponseBody(false, '请求参数错误');
            return;
        }

        // 直接操纵响应流
        await RepositoryInfo.rawFile(username, repositoryName, filePath, commitHash, ctx.session, ctx.res);
    });
};