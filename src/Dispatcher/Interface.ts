import Router from '@koa/router';

export interface ParameterValidator
{
    (body: any): boolean
}

export interface MiddlewareWrapper
{
    (): Router.Middleware
}