import {BlockDiffInfo} from './BlockDiffInfo';

export class BlockDiff
{
    public readonly additions: BlockDiffInfo;
    public readonly deletions: BlockDiffInfo;

    constructor(additions: BlockDiffInfo, deletions: BlockDiffInfo)
    {
        // deep clone
        this.additions = BlockDiffInfo.from(additions);
        this.deletions = BlockDiffInfo.from(deletions);
    }

    public static validate(blockDiff: Readonly<Record<keyof BlockDiff, any>>): boolean
    {
        const {additions, deletions} = blockDiff;
        return BlockDiffInfo.validate(additions) && BlockDiffInfo.validate(deletions);
    }

    public static from(blockDiff: Readonly<Record<keyof BlockDiff, any>>): BlockDiff
    {
        if (!BlockDiff.validate(blockDiff))
        {
            throw new TypeError();
        }
        const {additions, deletions} = blockDiff;
        return new BlockDiff(
            BlockDiffInfo.from(additions),
            BlockDiffInfo.from(deletions),
        );
    }
}