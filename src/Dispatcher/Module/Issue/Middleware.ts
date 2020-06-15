import {IRouteHandler} from '../../Interface';
import {WrongParameterError} from '../../Class';
import * as ParameterValidator from './ParameterValidator';
import {Issue as IssueService} from '../../../Service';

export const add: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.add(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {issue, issueComment} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await IssueService.add(issue, issueComment, username!);
    };
};

export const close: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.close(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repositoryUsername, repositoryName, no} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await IssueService.close(
            {repositoryUsername, repositoryName, no}, username!);
    };
};

export const reopen: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.reopen(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repositoryUsername, repositoryName, no} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await IssueService.reopen(
            {repositoryUsername, repositoryName, no}, username!);
    };
};

export const getByRepository: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getByRepository(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository, status, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await IssueService.getByRepository(repository, status, offset, limit, username);
    };
};

export const getAmountByRepository: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getAmountByRepository(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repository, status} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await IssueService.getAmountByRepository(repository, status, username);
    };
};

export const get: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.get(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {repositoryUsername, repositoryName, no} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await IssueService.get(
            {repositoryUsername, repositoryName, no}, username);
    };
};

export const getComments: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.getComments(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {issue, offset, limit} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await IssueService.getComments(issue, offset, limit, username);
    };
};

export const addComment: IRouteHandler = () =>
{
    return async ctx =>
    {
        if (!ParameterValidator.addComment(ctx.request.body))
        {
            throw new WrongParameterError();
        }
        const {issue, issueComment} = ctx.request.body;
        const {username} = ctx.session;
        ctx.state.serviceResponse = await IssueService.addComment(issue, issueComment, username!);
    };
};