import Router from '@koa/router';
import {Session} from 'koa-session';
import {ServiceResponse} from '../Class';

export interface IParameterValidator
{
    (body: any): boolean
}

export interface IState
{
    serviceResponse: ServiceResponse<any> | void
}

export interface IContext
{
    session: Session & { username?: string };
}

export interface IRouteHandler
{
    (): Router.Middleware<IState, IContext>
}