import Router from '@koa/router';
import {Session} from 'koa-session';
import {ServiceResponse} from '../Class';

export interface IParameterValidator
{
    (body: Readonly<any>): boolean
}

export interface IState
{
    serviceResponse: Readonly<ServiceResponse<any>> | Readonly<any> | void
}

export interface IContext
{
    session: Session & { username?: string };
}

export interface IRouteHandler
{
    (): Router.Middleware<IState, IContext>
}