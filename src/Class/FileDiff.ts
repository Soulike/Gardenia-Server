import {BlockDiff} from './BlockDiff';

export class FileDiff
{
    public readonly newFile: boolean;
    public readonly deleted: boolean;
    public readonly additionNumber: number;
    public readonly deletionNumber: number;
    public readonly blockDiffs: BlockDiff[];

    constructor(newFile: boolean, deleted: boolean, additionNumber: number, deletionNumber: number, blockDiffs: BlockDiff[])
    {
        if (newFile && deleted) // 文件不可能既创建又删除
        {
            throw new Error('newFile and deleted can not both be true');
        }
        this.newFile = newFile;
        this.deleted = deleted;
        this.additionNumber = additionNumber;
        this.deletionNumber = deletionNumber;
        this.blockDiffs = [];
        for (const blockDiff of blockDiffs)  // deep clone
        {
            this.blockDiffs.push(BlockDiff.from(blockDiff));
        }
    }

    public static from(fileDiff: Readonly<Record<keyof FileDiff, any>>): FileDiff
    {
        if (!FileDiff.validate(fileDiff))
        {
            throw new TypeError();
        }
        const {newFile, deleted, additionNumber, deletionNumber, blockDiffs} = fileDiff;
        return new FileDiff(newFile, deleted, additionNumber, deletionNumber, blockDiffs);
    }

    private static validate(fileDiff: Readonly<Record<keyof FileDiff, any>>): boolean
    {
        const {newFile, deleted, additionNumber, deletionNumber, blockDiffs} = fileDiff;
        if (typeof newFile !== 'boolean'
            || typeof deleted !== 'boolean'
            || typeof additionNumber !== 'number'
            || typeof deletionNumber !== 'number'
            || !Array.isArray(blockDiffs))
        {
            return false;
        }
        for (const blockDiff of blockDiffs)
        {
            if (!BlockDiff.validate(blockDiff))
            {
                return false;
            }
        }
        return true;
    }
}