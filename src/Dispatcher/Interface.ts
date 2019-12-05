import Router from '@koa/router';
import {Session} from 'koa-session';

export interface IParameterValidator
{
    (body: Readonly<any>): boolean
}

export interface IState
{
    serviceResponse: Readonly<any>
}

export interface IContext
{
    session: Session & { username?: string };
}

export interface IRouteHandler
{
    (): Router.Middleware<IState, IContext>
}