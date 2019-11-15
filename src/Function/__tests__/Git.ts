import {
    generateRepositoryPath,
    getAllBranches,
    getCommitCount,
    getFileCommitInfoList,
    getLastCommitInfo,
    getObjectHash,
    getObjectType,
    isEmptyRepository,
    putMasterBranchToFront,
} from '../Git';
import fs from 'fs';
import {exec} from 'child_process';
import {promisify} from 'util';
import fse from 'fs-extra';
import path from 'path';
import {Commit, Repository} from '../../Class';
import {ObjectType} from '../../CONSTANT';
import os from 'os';
import faker from 'faker';
import {GIT} from '../../CONFIG';

let repositoryPath = '';
let bareRepositoryPath = '';
const mainBranchName = 'main';
const branches = ['test1', 'test2', 'test3'];
const firstCommitFileName = 'testFile';
const firstCommitFolderName = 'testFolder';
const firstCommitFileInFolderPath = path.join(firstCommitFolderName, firstCommitFileName);
const firstCommitMessage = 'test';

describe(getAllBranches, () =>
{
    beforeAll(async () =>
    {
        await Promise.all([
            createRepository(),
            createBareRepository(),
        ]);
        await doFirstCommit();
        await createBranches();
        await changeMainBranchName();
    });

    afterAll(async () =>
    {
        await destroyRepository();
    });

    it('should get all branches', async function ()
    {
        expect(await getAllBranches(repositoryPath))
            .toEqual(expect.arrayContaining([mainBranchName, ...branches]));
    });

    it('should handle empty repository', async function ()
    {
        expect(await getAllBranches(bareRepositoryPath))
            .toEqual([]);
    });

    it('should reject when something is wrong', async function ()
    {
        await expect(getAllBranches('dadawdaw')).rejects.toThrow();
        await expect(getAllBranches(os.tmpdir())).rejects.toThrow();
    });
});

describe(putMasterBranchToFront, () =>
{
    it('should put master branch to front', function ()
    {
        const expectedBranches = [
            mainBranchName,
            ...branches,
        ];
        expect(putMasterBranchToFront([...branches, mainBranchName], mainBranchName))
            .toEqual(expectedBranches);
        expect(putMasterBranchToFront([mainBranchName, ...branches], mainBranchName))
            .toEqual(expectedBranches);
        expect(putMasterBranchToFront([...branches.slice(0, 1), mainBranchName, ...branches.slice(1)], mainBranchName))
            .toEqual(expectedBranches);
    });

    it('should throw error when the master branch name is not included in the branches', function ()
    {
        expect(() => putMasterBranchToFront(branches, mainBranchName)).toThrow(TypeError);
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
        expectedCommit.time = '';   // 防止测试运行时间差造成失败
        const commit = await getLastCommitInfo(repositoryPath, mainBranchName);
        commit.time = '';   // 防止测试运行时间差造成失败
        expect(commit).toStrictEqual(expectedCommit);
    });

    it('should get commit info of a file in a commit/branch', async function ()
    {
        const expectedCommit = await getFileCommitInfo(mainBranchName, firstCommitFileName);
        expectedCommit.time = '';   // 防止测试运行时间差造成失败
        const commit = await getLastCommitInfo(repositoryPath, mainBranchName, firstCommitFileName);
        commit.time = '';   // 防止测试运行时间差造成失败
        expect(commit).toStrictEqual(expectedCommit);
    });

    it('should reject when target does not exist', async function ()
    {
        await expect(getLastCommitInfo('addwadawd', mainBranchName, firstCommitFileName)).rejects.toThrow();
        await expect(getLastCommitInfo(repositoryPath, 'dawdawdawdfsf', firstCommitFileName)).rejects.toThrow();
        await expect(getLastCommitInfo(repositoryPath, mainBranchName, 'gergergergerg')).rejects.toThrow();
    });
});

describe(isEmptyRepository, () =>
{
    beforeAll(async () =>
    {
        await createBareRepository();
        await createRepository();
    });

    afterAll(async () =>
    {
        await destroyRepository();
    });

    it('should return true when repository is empty', async function ()
    {
        expect(await isEmptyRepository(bareRepositoryPath)).toBe(true);
    });

    it('should return false when repository is not empty', async function ()
    {
        await doFirstCommit();
        expect(await isEmptyRepository(repositoryPath)).toBe(false);
    });

    it('should reject when repository does not exist', async function ()
    {
        await expect(isEmptyRepository('dfafafeasfseg')).rejects.toThrow();
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
        const commitInfoList = await getFileCommitInfoList(repositoryPath, mainBranchName, '');
        commitInfoList.forEach(commitInfo => commitInfo.commit.time = '');   // 防止测试运行时间差造成失败
        const folderCommitInfo = await getFileCommitInfo(mainBranchName, firstCommitFolderName);
        folderCommitInfo.time = '';
        const fileCommitInfo = await getFileCommitInfo(mainBranchName, firstCommitFileName);
        fileCommitInfo.time = '';
        expect(commitInfoList).toContainEqual({
            type: ObjectType.TREE,
            path: firstCommitFolderName,
            commit: folderCommitInfo,
        });
        expect(commitInfoList).toContainEqual({
            type: ObjectType.BLOB,
            path: firstCommitFileName,
            commit: fileCommitInfo,
        });
    });

    it('should get file commit info list in folder', async function ()
    {
        const commitInfoList = await getFileCommitInfoList(repositoryPath, mainBranchName, firstCommitFileInFolderPath);
        commitInfoList.forEach(commitInfo => commitInfo.commit.time = '');   // 防止测试运行时间差造成失败
        const expectedCommit = await getFileCommitInfo(mainBranchName, firstCommitFileInFolderPath);
        expectedCommit.time = '';
        expect(commitInfoList).toContainEqual({
            type: ObjectType.BLOB,
            path: firstCommitFileInFolderPath,
            commit: expectedCommit,
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

describe(generateRepositoryPath, () =>
{
    it('should generate repository path', function ()
    {
        const fakeRepository = new Repository(faker.name.firstName(), faker.random.word(), faker.lorem.sentence(), true);
        expect(generateRepositoryPath(fakeRepository))
            .toBe(path.join(GIT.ROOT, fakeRepository.username, `${fakeRepository.name}.git`));
    });
});

describe(getCommitCount, () =>
{
    beforeAll(async () =>
    {
        await Promise.all([
            createBareRepository(),
            createRepository(),
        ]);
        await doFirstCommit();
        await changeMainBranchName();
    });

    afterAll(async () =>
    {
        await destroyRepository();
    });

    it('should get commit count', async function ()
    {
        expect(await getCommitCount(bareRepositoryPath, mainBranchName)).toBe(0);
        expect(await getCommitCount(repositoryPath, mainBranchName)).toBe(1);
    });

    it('should process error', async function ()
    {
        await Promise.all([
            expect(getCommitCount('/afaefeaf', mainBranchName)).rejects.toThrow(),
            expect(getCommitCount(os.tmpdir(), mainBranchName)).rejects.toThrow(),
            expect(getCommitCount(repositoryPath, 'dawdfgesafg')).rejects.toThrow(),
        ]);
    });
});

async function createRepository()
{
    repositoryPath = await fs.promises.mkdtemp(path.join(os.tmpdir(), '__test'));
    await promisify(exec)('git init', {cwd: repositoryPath});
}

async function createBareRepository()
{
    bareRepositoryPath = await fs.promises.mkdtemp(path.join(os.tmpdir(), '__test'));
    await promisify(exec)('git init --bare', {cwd: bareRepositoryPath});
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
    await fse.remove(bareRepositoryPath);
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