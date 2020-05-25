import Router from '@koa/router';
import {ISession} from '../Interface';

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
    session: ISession;
}

export interface IRouteHandler
{
    (): Router.Middleware<IState, IContext>
}