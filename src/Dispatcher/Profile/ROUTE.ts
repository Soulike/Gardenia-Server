function prefix(url: string): string
{
    return `/profile${url}`;
}

export const GET = prefix('/get');