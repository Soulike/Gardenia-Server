export class BlockDiffInfo
{
    public readonly start: number;
    public readonly end: number;
    public readonly code: string;

    constructor(start: number, end: number, code: string)
    {
        this.start = start;
        this.end = end;
        this.code = code;
    }

    public static validate(blockDiffInfo: Readonly<Record<keyof BlockDiffInfo, any>>): boolean
    {
        const {start, end, code} = blockDiffInfo;
        return typeof start === 'number'
            && typeof end === 'number'
            && typeof code === 'string';
    }

    public static from(blockDiffInfo: Readonly<Record<keyof BlockDiffInfo, any>>): BlockDiffInfo
    {
        if (!BlockDiffInfo.validate(blockDiffInfo))
        {
            throw new TypeError();
        }
        const {start, end, code} = blockDiffInfo;
        return new BlockDiffInfo(start, end, code);
    }
}