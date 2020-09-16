import Router from '@koa/router';
import {ISession} from '../Interface';
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
    session: Session & ISession;
}

export interface IRouteHandler<T extends any[] = void[]>
{
    (...args: T): Router.Middleware<IState, IContext>
}

export interface IDispatcher
{
    (router: Router<IState, IContext>): void
}