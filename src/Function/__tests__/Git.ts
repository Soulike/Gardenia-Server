import {
    doAdvertiseRPCCall,
    doRPCCall,
    generateRepositoryPath,
    getAllBranches,
    getCommitCount,
    getFileCommitInfoList,
    getLastCommitInfo,
    getObjectHash,
    getObjectReadStream,
    getObjectSize,
    getObjectType,
    isBinaryObject,
    objectExists,
    putMasterBranchToFront,
} from '../Git';
import fs from 'fs';
import {exec, spawn} from 'child_process';
import {promisify} from 'util';
import fse from 'fs-extra';
import path from 'path';
import {Commit, Repository} from '../../Class';
import {ObjectType} from '../../CONSTANT';
import os from 'os';
import faker from 'faker';
import {GIT} from '../../CONFIG';
import {Readable} from 'stream';

let repositoryPath = '';
let bareRepositoryPath = '';
const mainBranchName = 'main';
const branches = ['test1', 'test2', 'test3'];
const firstCommitFileName = 'testFile';
const firstCommitFileContent = `
    <?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
        "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg t="1573473234481" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3945"
     width="200" height="200">
    <defs>
        <style type="text/css"></style>
    </defs>
    <path d="M91 475s105-12 222 67 180 261 180 261-73-71-177-139c-93.4-61.1-149-6-194-69S91 475 91 475zM971.9 485s-105-12-222 67-180 261-180 261 73-71 177-139c93.4-61.1 149-6 194-69s31-120 31-120z"
          fill="#FFF5CC" p-id="3946"></path>
    <path d="M261 213s171.5 162.5 195.5 287.5S492 864 492 864s-41.2-192.1-124.9-257.3-101.6-77.2-129.6-167.2S261 213 261 213zM807.2 213S635.7 375.5 611.7 500.5 576.2 864 576.2 864 617.4 671.9 701 606.7s101.6-77.2 129.6-167.2S807.2 213 807.2 213z"
          fill="#FFFCEB" p-id="3947"></path>
    <path d="M518 106S296 210 358 410s175 428 175 428 135.6-262.3 170.8-444.2S518 106 518 106z" fill="#FFFCEB"
          p-id="3948"></path>
    <path d="M445.6 785.7c-9-24.5 25.3-47.7 88.4-48.2 63.1-0.5 96.6 21.4 96.6 44.5s-82 117.8-135.1 137.4C442.4 939 419.3 939 393.9 939c-25.4 0-27.7-45 19.6-62.3 47.4-17.4 41.1-66.5 32.1-91z"
          fill="#2C4432" p-id="3949"></path>
</svg>
    `;
const firstCommitFolderName = 'testFolder';
const firstCommitFileInFolderPath = path.join(firstCommitFolderName, firstCommitFileName);
const firstCommitMessage = 'test';
const binaryFileName = 'binaryFile';
const binaryFileSize = 101;

const childProcessMock = {
    spawn: jest.fn(),
};

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

describe(objectExists, () =>
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

    it('should check object existence', async function ()
    {
        await Promise.all([
            expect(objectExists(repositoryPath, firstCommitFolderName, mainBranchName)).resolves.toBe(true),
            expect(objectExists(repositoryPath, firstCommitFileName, mainBranchName)).resolves.toBe(true),
            expect(objectExists(repositoryPath, path.join(faker.random.word(), faker.random.word()), mainBranchName)).resolves.toBe(false),
        ]);
    });

    it('should reject when repository or commit hash does not exist', async function ()
    {
        await Promise.all([
            expect(objectExists(path.join(faker.random.word(), faker.random.word()), firstCommitFolderName, mainBranchName)).rejects.toThrow(),
            expect(objectExists(repositoryPath, firstCommitFileName, faker.random.alphaNumeric(64))).rejects.toThrow(),
        ]);
    });
});

describe(isBinaryObject, () =>
{
    beforeAll(async () =>
    {
        await createRepository();
        await doFirstCommit();
        await doBinaryCommit();
        await changeMainBranchName();
    });

    afterAll(async () =>
    {
        await destroyRepository();
    });

    it('should check binary object', async function ()
    {
        expect(
            await isBinaryObject(
                repositoryPath,
                await getObjectHash(repositoryPath, firstCommitFileName, mainBranchName)),
        ).toBe(false);
        expect(
            await isBinaryObject(
                repositoryPath,
                await getObjectHash(repositoryPath, firstCommitFileInFolderPath, mainBranchName)),
        ).toBe(false);
        expect(
            await isBinaryObject(
                repositoryPath,
                await getObjectHash(repositoryPath, binaryFileName, mainBranchName)),
        ).toBe(true);
    });
});

describe(getObjectSize, () =>
{
    beforeAll(async () =>
    {
        await createRepository();
        await doBinaryCommit();
        await changeMainBranchName();
    });

    afterAll(async () =>
    {
        await destroyRepository();
    });

    it('should get object size', async function ()
    {
        expect(
            await getObjectSize(
                repositoryPath,
                await getObjectHash(repositoryPath, binaryFileName, mainBranchName)),
        ).toBe(binaryFileSize);
    });
});

describe(getObjectReadStream, () =>
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

    it('should get object read stream', async function ()
    {
        const objectHash = await getObjectHash(repositoryPath, firstCommitFileName, mainBranchName);
        const readStream = getObjectReadStream(repositoryPath, objectHash);
        let content = '';
        for await(const data of readStream)
        {
            content += data;
        }
        expect(content).toBe(firstCommitFileContent);
    });
});

describe(doAdvertiseRPCCall, () =>
{
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeService = `git-${faker.random.word()}`;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('child_process', () => childProcessMock);
    });

    it('should execute correct command and return output', async function ()
    {
        childProcessMock.spawn.mockImplementation(() =>
        {
            return spawn(`echo hello`, {shell: true});
        });
        const {doAdvertiseRPCCall} = await import('../Git');
        expect(await doAdvertiseRPCCall(fakeRepositoryPath, fakeService)).toBe('hello\n');
        expect(childProcessMock.spawn.mock.calls).toEqual([
            [
                `LANG=en_US git ${fakeService.slice(4)} --stateless-rpc --advertise-refs ${fakeRepositoryPath}`,
                {shell: true},
            ],
        ]);
    });

    it('should throw command executing error', async function ()
    {
        childProcessMock.spawn.mockImplementation(() =>
        {
            childProcessMock.spawn.mockImplementation(() =>
            {
                throw Error();
            });
        });

        const {doAdvertiseRPCCall} = await import('../Git');
        await expect(doAdvertiseRPCCall(fakeRepositoryPath, fakeService)).rejects.toThrow();
        expect(childProcessMock.spawn.mock.calls).toEqual([
            [
                `LANG=en_US git ${fakeService.slice(4)} --stateless-rpc --advertise-refs ${fakeRepositoryPath}`,
                {shell: true},
            ],
        ]);
    });
});

describe(doRPCCall, () =>
{
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeCommand = `${faker.random.word()}`;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('child_process', () => childProcessMock);
    });

    it('should execute correct command and return stdout stream', async function ()
    {
        const fakeStdout = new Readable();
        childProcessMock.spawn.mockReturnValue({stdout: fakeStdout});
        const {doRPCCall} = await import('../Git');
        expect(doRPCCall(fakeRepositoryPath, fakeCommand)).toEqual(fakeStdout);
        expect(childProcessMock.spawn.mock.calls).toEqual([
            [
                `LANG=en_US git ${fakeCommand} --stateless-rpc ${fakeRepositoryPath}`,
                {shell: true},
            ],
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
    await fs.promises.writeFile(path.join(repositoryPath, firstCommitFileName), firstCommitFileContent);
    await fs.promises.mkdir(path.join(repositoryPath, firstCommitFolderName));
    await fs.promises.writeFile(path.join(repositoryPath, firstCommitFileInFolderPath), `
{
    "name": "soulike-git",
    "version": "0.1.0",
    "private": true,
}
    `);
    await promisify(exec)('git add .', {cwd: repositoryPath});
    await promisify(exec)(`git commit -m "${firstCommitMessage}"`, {cwd: repositoryPath});
}

async function doBinaryCommit()
{
    const binary = [];
    for (let i = 0; i < binaryFileSize; i++)
    {
        binary.push(faker.random.number(255));
    }
    await fs.promises.writeFile(
        path.join(repositoryPath, binaryFileName),
        Buffer.from(binary));
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