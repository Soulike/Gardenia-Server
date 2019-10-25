import {getBranches, getFileCommitInfoList, getLastCommitInfo, getObjectHash, getObjectType} from '../Git';
import fs from 'fs';
import {exec} from 'child_process';
import {promisify} from 'util';
import fse from 'fs-extra';
import path from 'path';
import {Commit} from '../../Class';
import {ObjectType} from '../../CONSTANT';
import os from 'os';

let repositoryPath = '';
const branches = ['test1', 'test2', 'test3'];
const mainBranchName = 'main';
const firstCommitFileName = 'testFile';
const firstCommitFolderName = 'testFolder';
const firstCommitFileInFolderPath = path.join(firstCommitFolderName, firstCommitFileName);
const firstCommitMessage = 'test';

describe(getBranches, () =>
{
    beforeAll(async () =>
    {
        await createRepository();
        await doFirstCommit();
        await createBranches();
        await changeMainBranchName();
    });

    afterAll(async () =>
    {
        await destroyRepository();
    });

    it('should get all branches and put main branch at first', async function ()
    {
        const ret = await getBranches(repositoryPath);
        expect(ret).toStrictEqual([mainBranchName, ...branches]);
    });

    it('should reject when something is wrong', async function ()
    {
        await expect(getBranches('dadawdaw')).rejects.toThrow();
    });
});

describe(getLastCommitInfo, () =>
{
    beforeAll(async () =>
    {
        await createRepository();
        await doFirstCommit();
        await changeMainBranchName();
    });

    afterAll(async () =>
    {
        await destroyRepository();
    });

    it('should get commit info of a commit/branch', async function ()
    {
        const expectedCommit = await getCommitInfo(mainBranchName);
        const commit = await getLastCommitInfo(repositoryPath, mainBranchName);
        expect(commit).toStrictEqual(expectedCommit);
    });

    it('should get commit info of a file in a commit/branch', async function ()
    {
        const expectedCommit = await getFileCommitInfo(mainBranchName, firstCommitFileName);
        const commit = await getLastCommitInfo(repositoryPath, mainBranchName, firstCommitFileName);
        expect(commit).toStrictEqual(expectedCommit);
    });

    it('should reject when target does not exist', async function ()
    {
        await expect(getLastCommitInfo('addwadawd', mainBranchName, firstCommitFileName)).rejects.toThrow();
        await expect(getLastCommitInfo(repositoryPath, 'dawdawdawdfsf', firstCommitFileName)).rejects.toThrow();
        await expect(getLastCommitInfo(repositoryPath, mainBranchName, 'gergergergerg')).rejects.toThrow();
    });
});

describe(getFileCommitInfoList, () =>
{
    beforeAll(async () =>
    {
        await createRepository();
        await doFirstCommit();
        await changeMainBranchName();
    });

    afterAll(async () =>
    {
        await destroyRepository();
    });

    it('should get file commit info list at root', async function ()
    {
        const retAtRoot = await getFileCommitInfoList(repositoryPath, mainBranchName, '');
        expect(retAtRoot).toContainEqual({
            type: ObjectType.TREE,
            path: firstCommitFolderName,
            commit: await getFileCommitInfo(mainBranchName, firstCommitFolderName),
        });
        expect(retAtRoot).toContainEqual({
            type: ObjectType.BLOB,
            path: firstCommitFileName,
            commit: await getFileCommitInfo(mainBranchName, firstCommitFileName),
        });
    });

    it('should get file commit info list in folder', async function ()
    {
        const retAtRoot = await getFileCommitInfoList(repositoryPath, mainBranchName, firstCommitFileInFolderPath);
        expect(retAtRoot).toContainEqual({
            type: ObjectType.BLOB,
            path: firstCommitFileInFolderPath,
            commit: await getFileCommitInfo(mainBranchName, firstCommitFileInFolderPath),
        });
    });

    it('should reject when target folder does not exist', async function ()
    {
        await expect(getFileCommitInfoList('dawdawdaw', mainBranchName, firstCommitFileInFolderPath)).rejects.toThrow();
        await expect(getFileCommitInfoList(repositoryPath, 'dawfgderhde', firstCommitFileInFolderPath)).rejects.toThrow();
        await expect(getFileCommitInfoList(repositoryPath, mainBranchName, 'hehehethrthaw')).rejects.toThrow();
    });
});

describe(getObjectHash, () =>
{
    beforeAll(async () =>
    {
        await createRepository();
        await doFirstCommit();
        await changeMainBranchName();
    });

    afterAll(async () =>
    {
        await destroyRepository();
    });

    it('should get hash of object', async function ()
    {
        // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
        const lsTreeOut = await promisify(exec)(`git ls-tree ${mainBranchName} -- ${firstCommitFileName}`,
            {cwd: repositoryPath});
        expect(await getObjectHash(repositoryPath, firstCommitFileName, mainBranchName))
            .toBe(lsTreeOut.stdout.split(/\s+/)[2]);
    });

    it('should reject when target does not exist', async function ()
    {
        await expect(getObjectHash('wadawdawdawdaw', firstCommitFileName, mainBranchName)).rejects.toThrow();
        await expect(getObjectHash(repositoryPath, 'awdawdawdawfgswgdsr', mainBranchName)).rejects.toThrow();
        await expect(getObjectHash(repositoryPath, firstCommitFileName, 'ghdhjedghdrh')).rejects.toThrow();
    });
});

describe(getObjectType, () =>
{
    beforeAll(async () =>
    {
        await createRepository();
        await doFirstCommit();
        await changeMainBranchName();
    });

    afterAll(async () =>
    {
        await destroyRepository();
    });

    it('should get type of blob object', async function ()
    {
        // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
        const lsTreeOut = await promisify(exec)(`git ls-tree ${mainBranchName} -- ${firstCommitFileName}`,
            {cwd: repositoryPath});
        expect(await getObjectType(repositoryPath, firstCommitFileName, mainBranchName))
            .toBe(lsTreeOut.stdout.split(/\s+/)[1]);
    });

    it('should get type of tree object', async function ()
    {
        // 格式为 "100644 blob bbdf566e2f8da7288558241c5ffba6c32f943826	yarn.lock"
        const lsTreeOut = await promisify(exec)(`git ls-tree ${mainBranchName} -- ${firstCommitFolderName}`,
            {cwd: repositoryPath});
        expect(await getObjectType(repositoryPath, firstCommitFolderName, mainBranchName))
            .toBe(lsTreeOut.stdout.split(/\s+/)[1]);
    });

    it('should reject when target does not exist', async function ()
    {
        await expect(getObjectType('wadawdawdawdaw', firstCommitFileName, mainBranchName)).rejects.toThrow();
        await expect(getObjectType(repositoryPath, 'awdawdawdawfgswgdsr', mainBranchName)).rejects.toThrow();
        await expect(getObjectType(repositoryPath, firstCommitFileName, 'ghdhjedghdrh')).rejects.toThrow();
    });
});

async function createRepository()
{
    repositoryPath = await fs.promises.mkdtemp(path.join(os.tmpdir(), '__test'));
    await promisify(exec)('git init', {cwd: repositoryPath});
}

async function doFirstCommit()
{
    await fs.promises.writeFile(path.join(repositoryPath, firstCommitFileName), '');
    await fs.promises.mkdir(path.join(repositoryPath, firstCommitFolderName));
    await fs.promises.writeFile(path.join(repositoryPath, firstCommitFileInFolderPath), '');
    await promisify(exec)('git add .', {cwd: repositoryPath});
    await promisify(exec)(`git commit -m "${firstCommitMessage}"`, {cwd: repositoryPath});
}

async function destroyRepository()
{
    await fse.remove(repositoryPath);
}

async function createBranches()
{
    await Promise.all(branches.map(async (branch) =>
    {
        await promisify(exec)(`git branch ${branch}`, {cwd: repositoryPath});
    }));
}

async function changeMainBranchName()
{
    await promisify(exec)(`git branch -m master ${mainBranchName}`, {cwd: repositoryPath});
}

async function getCommitInfo(commitHash: string): Promise<Commit>
{
    const info = await Promise.all([
        promisify(exec)(`LANG=zh_CN.UTF-8 git log --pretty=format:'%H' -1 ${commitHash}`, {cwd: repositoryPath}),
        promisify(exec)(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cn' -1 ${commitHash}`, {cwd: repositoryPath}),
        promisify(exec)(`LANG=zh_CN.UTF-8 git log --pretty=format:'%ce' -1 ${commitHash}`, {cwd: repositoryPath}),
        promisify(exec)(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cr' -1 ${commitHash}`, {cwd: repositoryPath}),
        promisify(exec)(`LANG=zh_CN.UTF-8 git log --pretty=format:'%s' -1 ${commitHash}`, {cwd: repositoryPath}),
    ]);

    return new Commit(info[0].stdout, info[1].stdout, info[2].stdout, info[3].stdout, info[4].stdout);
}

async function getFileCommitInfo(commitHash: string, filePath: string): Promise<Commit>
{
    const info = await Promise.all([
        promisify(exec)(`LANG=zh_CN.UTF-8 git log --pretty=format:'%H' -1 ${commitHash} -- ${filePath}`, {cwd: repositoryPath}),
        promisify(exec)(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cn' -1 ${commitHash} -- ${filePath}`, {cwd: repositoryPath}),
        promisify(exec)(`LANG=zh_CN.UTF-8 git log --pretty=format:'%ce' -1 ${commitHash} -- ${filePath}`, {cwd: repositoryPath}),
        promisify(exec)(`LANG=zh_CN.UTF-8 git log --pretty=format:'%cr' -1 ${commitHash} -- ${filePath}`, {cwd: repositoryPath}),
        promisify(exec)(`LANG=zh_CN.UTF-8 git log --pretty=format:'%s' -1 ${commitHash} -- ${filePath}`, {cwd: repositoryPath}),
    ]);

    return new Commit(info[0].stdout, info[1].stdout, info[2].stdout, info[3].stdout, info[4].stdout);
}