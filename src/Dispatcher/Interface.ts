import Router from '@koa/router';
import {Session} from 'koa-session';
import {VERIFICATION_CODE_TYPE} from '../CONSTANT';

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

export interface ISession
{
    username?: string,
    verification?: {
        type: VERIFICATION_CODE_TYPE,
        email: string,
        verificationCode: string
    }
}

export interface IRouteHandler
{
    (): Router.Middleware<IState, IContext>
}