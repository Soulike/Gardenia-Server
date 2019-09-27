import {spawn} from 'child_process';

export namespace File
{
    /**
     * @description 删除文件或递归删除文件夹
     * @description 截止 Node 12，fs 中递归删除文件夹的功能仍为试验性，因此目前函数调用 rm 实现。为跨平台考虑，在 Api 稳定之后可修改实现
     * */
    export async function rm(path: string): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            const childProcess = spawn(`rm -rf ${path}`, {
                shell: true,
            });
            childProcess.on('exit', () =>
            {
                resolve();
            });
            childProcess.on('error', err =>
            {
                reject(err);
            });
        });
    }
}