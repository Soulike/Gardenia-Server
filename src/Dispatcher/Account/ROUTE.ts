function prefix(url: string): string
{
    return `/account${url}`;
}

export const LOGIN = prefix('/login');
export const REGISTER = prefix('/register');
export const CHECK_SESSION = prefix('/checkSession');