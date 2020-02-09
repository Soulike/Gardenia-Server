export function splitToLines(string: string): string[]
{
    return string.split('\n').filter(line => line.length !== 0);
}