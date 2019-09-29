function prefix(url: string): string
{
    return `/repository${url}`;
}

export const CREATE = prefix('/create');
export const DEL = prefix('/del');
export const GET_FILE = prefix('/getFile');
export const GET_LIST = prefix('/getList');