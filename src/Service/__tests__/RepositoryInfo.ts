import {branch, commitCount, directory, fileInfo, lastCommit, rawFile, repository} from '../RepositoryInfo';
import {Account, Commit, Repository, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';
import path from 'path';
import {ObjectType} from '../../CONSTANT';
import {Repository as RepositoryTable} from '../../Database';
import {Git, Repository as RepositoryFunction} from '../../Function';
import {Readable} from 'stream';
import mime from 'mime-types';

const databaseMock = {
    Repository: {
        selectByUsernameAndName: jest.fn<ReturnType<typeof RepositoryTable.selectByUsernameAndName>,
            Parameters<typeof RepositoryTable.selectByUsernameAndName>>(),
    },
};

const functionMock = {
    Git: {
        getAllBranches: jest.fn<ReturnType<typeof Git.getAllBranches>,
            Parameters<typeof Git.getAllBranches>>(),
        putMasterBranchToFront: jest.fn<ReturnType<typeof Git.putMasterBranchToFront>,
            Parameters<typeof Git.putMasterBranchToFront>>(),
        generateRepositoryPath: jest.fn<ReturnType<typeof Git.generateRepositoryPath>,
            Parameters<typeof Git.generateRepositoryPath>>(),
        getLastCommitInfo: jest.fn<ReturnType<typeof Git.getLastCommitInfo>,
            Parameters<typeof Git.getLastCommitInfo>>(),
        getFileCommitInfoList: jest.fn<ReturnType<typeof Git.getFileCommitInfoList>,
            Parameters<typeof Git.getFileCommitInfoList>>(),
        getCommitCount: jest.fn<ReturnType<typeof Git.getCommitCount>,
            Parameters<typeof Git.getCommitCount>>(),
        objectExists: jest.fn<ReturnType<typeof Git.objectExists>,
            Parameters<typeof Git.objectExists>>(),
        getObjectHash: jest.fn<ReturnType<typeof Git.getObjectHash>,
            Parameters<typeof Git.getObjectHash>>(),
        getObjectType: jest.fn<ReturnType<typeof Git.getObjectType>,
            Parameters<typeof Git.getObjectType>>(),
        isBinaryObject: jest.fn<ReturnType<typeof Git.isBinaryObject>,
            Parameters<typeof Git.isBinaryObject>>(),
        getObjectSize: jest.fn<ReturnType<typeof Git.getObjectSize>,
            Parameters<typeof Git.getObjectSize>>(),
        getObjectReadStream: jest.fn<ReturnType<typeof Git.getObjectReadStream>,
            Parameters<typeof Git.getObjectReadStream>>(),
    },
    Repository: {
        repositoryIsAvailableToTheViewer: RepositoryFunction.repositoryIsAvailableToTheViewer,
    },
};

describe(repository, () =>
{
    const fakeAccount = new Account(
        faker.name.firstName(),
        faker.random.alphaNumeric(64),
    );

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
    });

    it('everyone can get the info of a public repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        const {repository} = await import('../RepositoryInfo');

        expect(
            await repository(fakeAccount, fakeRepository, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeRepository)));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
    });

    it('only owner can get the info of a private repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        const {repository} = await import('../RepositoryInfo');

        expect(
            await repository(fakeAccount, fakeRepository, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });

        expect(
            await repository(fakeAccount, fakeRepository, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeRepository)));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
    });

    it('should check repository existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        const {repository} = await import('../RepositoryInfo');
        expect(
            await repository(fakeAccount, fakeRepository, {} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
    });
});

describe(branch, () =>
{
    const fakeAccount = new Account(
        faker.name.firstName(),
        faker.random.alphaNumeric(64),
    );
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeBranches = [
        faker.random.word(),
        faker.random.word(),
        faker.random.word(),
        faker.random.word(),
    ];

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        functionMock.Git.getAllBranches.mockResolvedValue(fakeBranches);
        functionMock.Git.putMasterBranchToFront.mockReturnValue(fakeBranches);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
    });

    it('everyone can get the branches of a public repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        const {branch} = await import('../RepositoryInfo');
        expect(
            await branch(fakeAccount, fakeRepository, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeBranches)));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getAllBranches.mock.calls.length).toBe(1);
        expect(functionMock.Git.getAllBranches.mock.calls[0][0]).toBe(fakeRepositoryPath);
        expect(functionMock.Git.putMasterBranchToFront.mock.calls.length).toBe(1);
        expect(functionMock.Git.putMasterBranchToFront.mock.calls[0][0]).toEqual(fakeBranches);
    });

    it('only owner can get the branches of a private repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        const {branch} = await import('../RepositoryInfo');

        expect(
            await branch(fakeAccount, fakeRepository, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getAllBranches.mock.calls.length).toBe(0);
        expect(functionMock.Git.putMasterBranchToFront.mock.calls.length).toBe(0);

        expect(
            await branch(fakeAccount, fakeRepository, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeBranches)));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getAllBranches.mock.calls.length).toBe(1);
        expect(functionMock.Git.getAllBranches.mock.calls[0][0]).toBe(fakeRepositoryPath);
        expect(functionMock.Git.putMasterBranchToFront.mock.calls.length).toBe(1);
        expect(functionMock.Git.putMasterBranchToFront.mock.calls[0][0]).toEqual(fakeBranches);
    });

    it('should check repository existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        const {branch} = await import('../RepositoryInfo');
        expect(
            await branch(fakeAccount, fakeRepository, {} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);
        expect(functionMock.Git.getAllBranches.mock.calls.length).toBe(0);
        expect(functionMock.Git.putMasterBranchToFront.mock.calls.length).toBe(0);
    });
});

describe(lastCommit, () =>
{
    const fakeAccount = new Account(
        faker.name.firstName(),
        faker.random.alphaNumeric(64),
    );
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeFilePath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeCommit = new Commit(
        faker.random.alphaNumeric(64),
        faker.name.firstName(),
        faker.internet.email(),
        faker.date.recent().toISOString(),
        faker.lorem.sentence());

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        functionMock.Git.getLastCommitInfo.mockResolvedValue(fakeCommit);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
    });

    it('everyone can get the last commit of a public repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        const {lastCommit} = await import('../RepositoryInfo');

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: faker.random.word()} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeCommit)));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getLastCommitInfo.mock.calls.length).toBe(1);
        expect(functionMock.Git.getLastCommitInfo.mock.calls[0][0]).toBe(fakeRepositoryPath);
        expect(functionMock.Git.getLastCommitInfo.mock.calls[0][1]).toBe(fakeCommit.commitHash);
        expect(functionMock.Git.getLastCommitInfo.mock.calls[0][2]).toBe(fakeFilePath);

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: fakeAccount.username} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeCommit)));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(2);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[1][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getLastCommitInfo.mock.calls.length).toBe(2);
        expect(functionMock.Git.getLastCommitInfo.mock.calls[1][0]).toBe(fakeRepositoryPath);
        expect(functionMock.Git.getLastCommitInfo.mock.calls[1][1]).toBe(fakeCommit.commitHash);
        expect(functionMock.Git.getLastCommitInfo.mock.calls[1][2]).toBe(fakeFilePath);
    });

    it('only owner can get the last commit of a private repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        const {lastCommit} = await import('../RepositoryInfo');

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: faker.random.word()} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getLastCommitInfo.mock.calls.length).toBe(0);

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: fakeAccount.username} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeCommit)));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getLastCommitInfo.mock.calls.length).toBe(1);
        expect(functionMock.Git.getLastCommitInfo.mock.calls[0][0]).toBe(fakeRepositoryPath);
        expect(functionMock.Git.getLastCommitInfo.mock.calls[0][1]).toBe(fakeCommit.commitHash);
        expect(functionMock.Git.getLastCommitInfo.mock.calls[0][2]).toBe(fakeFilePath);
    });

    it('should check repository existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        const {lastCommit} = await import('../RepositoryInfo');
        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);
        expect(functionMock.Git.getLastCommitInfo.mock.calls.length).toBe(0);
    });
});

describe(directory, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeCommitInfoList = [
        {
            type: ObjectType.BLOB,
            path: '/',
            commit: new Commit(
                faker.random.alphaNumeric(64),
                faker.name.firstName(),
                faker.internet.email(),
                faker.date.recent().toString(),
                faker.lorem.sentence(),
            ),
        },
        {
            type: ObjectType.BLOB,
            path: '/',
            commit: new Commit(
                faker.random.alphaNumeric(64),
                faker.name.firstName(),
                faker.internet.email(),
                faker.date.recent().toString(),
                faker.lorem.sentence(),
            ),
        },
        {
            type: ObjectType.TREE,
            path: '/',
            commit: new Commit(
                faker.random.alphaNumeric(64),
                faker.name.firstName(),
                faker.internet.email(),
                faker.date.recent().toString(),
                faker.lorem.sentence(),
            ),
        },
        {
            type: ObjectType.TREE,
            path: '/',
            commit: new Commit(
                faker.random.alphaNumeric(64),
                faker.name.firstName(),
                faker.internet.email(),
                faker.date.recent().toString(),
                faker.lorem.sentence(),
            ),
        },
        {
            type: ObjectType.BLOB,
            path: '/',
            commit: new Commit(
                faker.random.alphaNumeric(64),
                faker.name.firstName(),
                faker.internet.email(),
                faker.date.recent().toString(),
                faker.lorem.sentence(),
            ),
        },
        {
            type: ObjectType.TREE,
            path: '/',
            commit: new Commit(
                faker.random.alphaNumeric(64),
                faker.name.firstName(),
                faker.internet.email(),
                faker.date.recent().toString(),
                faker.lorem.sentence(),
            ),
        },
        {
            type: ObjectType.TREE,
            path: '/',
            commit: new Commit(
                faker.random.alphaNumeric(64),
                faker.name.firstName(),
                faker.internet.email(),
                faker.date.recent().toString(),
                faker.lorem.sentence(),
            ),
        },
        {
            type: ObjectType.BLOB,
            path: '/',
            commit: new Commit(
                faker.random.alphaNumeric(64),
                faker.name.firstName(),
                faker.internet.email(),
                faker.date.recent().toString(),
                faker.lorem.sentence(),
            ),
        },
    ];
    const sortedCommitInfoListCopy = [...fakeCommitInfoList];
    const fakeCommitHash = faker.random.alphaNumeric(64);
    const fakeDirectoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());

    beforeAll(() =>
    {
        sortedCommitInfoListCopy.sort((a, b) =>
        {
            if (a.type === ObjectType.TREE && b.type === ObjectType.BLOB)
            {
                return -1;
            }
            else if (a.type === ObjectType.BLOB && b.type === ObjectType.TREE)
            {
                return 1;
            }
            else
            {
                return 0;
            }
        });
    });

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
    });

    it('everyone can get the directory info of a public repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getFileCommitInfoList.mockResolvedValue([...sortedCommitInfoListCopy]);
        const {directory} = await import('../RepositoryInfo');

        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(
            200,
            {},
            new ResponseBody(
                true,
                '',
                sortedCommitInfoListCopy,
            ),
        ));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getFileCommitInfoList.mock.calls.length).toBe(1);
        expect(functionMock.Git.getFileCommitInfoList.mock.calls[0]).toEqual([
            fakeRepositoryPath,
            fakeCommitHash,
            fakeDirectoryPath,
        ]);
    });

    it('only owner can get the directory info of a private repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getFileCommitInfoList.mockResolvedValue([...sortedCommitInfoListCopy]);
        const {directory} = await import('../RepositoryInfo');
        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(
            404,
            {},
            new ResponseBody<void>(
                false,
                '仓库不存在',
            ),
        ));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);
        expect(functionMock.Git.getFileCommitInfoList.mock.calls.length).toBe(0);

        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(
            200,
            {},
            new ResponseBody(
                true,
                '',
                sortedCommitInfoListCopy,
            ),
        ));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getFileCommitInfoList.mock.calls.length).toBe(1);
        expect(functionMock.Git.getFileCommitInfoList.mock.calls[0]).toEqual([
            fakeRepositoryPath,
            fakeCommitHash,
            fakeDirectoryPath,
        ]);
    });

    it('should check repository existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        functionMock.Git.getFileCommitInfoList.mockResolvedValue([...fakeCommitInfoList]);
        const {directory} = await import('../RepositoryInfo');
        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(
            404,
            {},
            new ResponseBody<void>(
                false,
                '仓库不存在',
            ),
        ));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);
        expect(functionMock.Git.getFileCommitInfoList.mock.calls.length).toBe(0);
    });

    it('should check directory path existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        const fakeError = new Error(faker.lorem.sentence());

        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getFileCommitInfoList.mockRejectedValue(fakeError);
        const {directory} = await import('../RepositoryInfo');
        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(
            404,
            {},
            new ResponseBody<void>(
                false,
                '文件不存在',
            ),
        ));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getFileCommitInfoList.mock.calls.length).toBe(1);
        expect(functionMock.Git.getFileCommitInfoList.mock.calls[0]).toEqual([
            fakeRepositoryPath,
            fakeCommitHash,
            fakeDirectoryPath,
        ]);
    });

    it('should sort directory content array', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getFileCommitInfoList.mockResolvedValue([...fakeCommitInfoList]);
        const {directory} = await import('../RepositoryInfo');
        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {} as unknown as Session),
        ).toEqual(new ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }>>(
            200,
            {},
            new ResponseBody<Array<{ type: ObjectType, path: string, commit: Commit }>>(
                true,
                '',
                sortedCommitInfoListCopy,
            ),
        ));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });
        expect(functionMock.Git.getFileCommitInfoList.mock.calls.length).toBe(1);
        expect(functionMock.Git.getFileCommitInfoList.mock.calls[0]).toEqual([
            fakeRepositoryPath,
            fakeCommitHash,
            fakeDirectoryPath,
        ]);
    });
});

describe(commitCount, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeCommitCount = faker.random.number();
    const fakeCommitHash = faker.random.alphaNumeric(64);

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
    });

    it('everyone can get the commit count of a public repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getCommitCount.mockResolvedValue(fakeCommitCount);
        const {commitCount} = await import('../RepositoryInfo');
        expect(
            await commitCount(
                {username: fakeAccount.username},
                {name: fakeRepository.name},
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse<{ commitCount: number }>(200, {},
            new ResponseBody<{ commitCount: number }>(true, '', {commitCount: fakeCommitCount})));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.getCommitCount.mock.calls.length).toBe(1);
        expect(functionMock.Git.getCommitCount.mock.calls[0]).toEqual([
            fakeRepositoryPath,
            fakeCommitHash,
        ]);

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
    });

    it('only owner can get the commit count of a private repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getCommitCount.mockResolvedValue(fakeCommitCount);
        const {commitCount} = await import('../RepositoryInfo');
        expect(
            await commitCount(fakeAccount, fakeRepository, fakeCommitHash, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在')));

        expect(
            await commitCount(fakeAccount, fakeRepository, fakeCommitHash, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse<{ commitCount: number }>(200, {},
            new ResponseBody<{ commitCount: number }>(true, '', {commitCount: fakeCommitCount})));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.getCommitCount.mock.calls.length).toBe(1);
        expect(functionMock.Git.getCommitCount.mock.calls[0]).toEqual([
            fakeRepositoryPath,
            fakeCommitHash,
        ]);

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
    });

    it('should check repository existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        functionMock.Git.getCommitCount.mockResolvedValue(fakeCommitCount);
        const {commitCount} = await import('../RepositoryInfo');
        expect(
            await commitCount(fakeAccount, fakeRepository, fakeCommitHash, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在')));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.getCommitCount.mock.calls.length).toBe(0);

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);
    });

    it('should check commit hash existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getCommitCount.mockRejectedValue(new Error());
        const {commitCount} = await import('../RepositoryInfo');
        expect(
            await commitCount(
                {username: fakeAccount.username},
                {name: fakeRepository.name},
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支或提交不存在')));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.getCommitCount.mock.calls.length).toBe(1);
        expect(functionMock.Git.getCommitCount.mock.calls[0]).toEqual([
            fakeRepositoryPath,
            fakeCommitHash,
        ]);

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
    });
});

describe(fileInfo, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeObjectHash = faker.random.alphaNumeric(64);
    const fakeObjectType = ObjectType.BLOB;
    const fakeObjectSize = faker.random.number();
    const fakeFilePath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeCommitHash = faker.random.alphaNumeric(64);

    beforeEach(async () =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        functionMock.Git.getObjectHash.mockResolvedValue(fakeObjectHash);
        functionMock.Git.getObjectType.mockResolvedValue(fakeObjectType);
        functionMock.Git.getObjectSize.mockResolvedValue(fakeObjectSize);
    });

    it('everyone can get the file info of a public repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockResolvedValue(true);
        functionMock.Git.isBinaryObject.mockResolvedValue(false);

        const {fileInfo} = await import('../RepositoryInfo');
        expect(
            await fileInfo(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(
                    true, '', {
                        exists: true, isBinary: false, type: fakeObjectType, size: fakeObjectSize,
                    },
                )));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.objectExists.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeFilePath, fakeCommitHash,
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeFilePath, fakeCommitHash,
        ]);
        expect(functionMock.Git.isBinaryObject.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeObjectHash,
        ]);
        expect(functionMock.Git.getObjectSize.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeObjectHash,
        ]);
    });

    it('only owner can get the file info of a private repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockResolvedValue(true);
        functionMock.Git.isBinaryObject.mockResolvedValue(false);

        const {fileInfo} = await import('../RepositoryInfo');
        expect(
            await fileInfo(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(
            new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);
        expect(functionMock.Git.objectExists.mock.calls.length).toBe(0);
        expect(functionMock.Git.getObjectHash.mock.calls.length).toBe(0);
        expect(functionMock.Git.isBinaryObject.mock.calls.length).toBe(0);
        expect(functionMock.Git.getObjectSize.mock.calls.length).toBe(0);

        expect(
            await fileInfo(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: fakeAccount.username} as unknown as Session),
        ).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(
                    true, '', {
                        exists: true, isBinary: false, type: fakeObjectType, size: fakeObjectSize,
                    },
                )));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.objectExists.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeFilePath, fakeCommitHash,
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeFilePath, fakeCommitHash,
        ]);
        expect(functionMock.Git.isBinaryObject.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeObjectHash,
        ]);
        expect(functionMock.Git.getObjectSize.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeObjectHash,
        ]);
    });

    it('should check repository existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        functionMock.Git.objectExists.mockResolvedValue(true);
        functionMock.Git.isBinaryObject.mockResolvedValue(false);

        const {fileInfo} = await import('../RepositoryInfo');
        expect(
            await fileInfo(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: fakeAccount.username} as unknown as Session),
        ).toEqual(
            new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);
        expect(functionMock.Git.objectExists.mock.calls.length).toBe(0);
        expect(functionMock.Git.getObjectHash.mock.calls.length).toBe(0);
        expect(functionMock.Git.isBinaryObject.mock.calls.length).toBe(0);
        expect(functionMock.Git.getObjectSize.mock.calls.length).toBe(0);
    });

    it('should check object existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockResolvedValue(false);
        functionMock.Git.isBinaryObject.mockResolvedValue(false);

        const {fileInfo} = await import('../RepositoryInfo');
        expect(
            await fileInfo(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(
                    true, '', {
                        exists: false,
                    },
                )));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.objectExists.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeFilePath, fakeCommitHash,
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls.length).toBe(0);
        expect(functionMock.Git.isBinaryObject.mock.calls.length).toBe(0);
        expect(functionMock.Git.getObjectSize.mock.calls.length).toBe(0);
    });

    it('should check commit hash existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockRejectedValue(new Error());
        functionMock.Git.isBinaryObject.mockResolvedValue(false);

        const {fileInfo} = await import('../RepositoryInfo');
        expect(
            await fileInfo(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(
            new ServiceResponse(404, {},
                new ResponseBody(false, '分支或提交不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.objectExists.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeFilePath, fakeCommitHash,
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls.length).toBe(0);
        expect(functionMock.Git.isBinaryObject.mock.calls.length).toBe(0);
        expect(functionMock.Git.getObjectSize.mock.calls.length).toBe(0);
    });

    it('should check whether file is binary', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockResolvedValue(true);
        functionMock.Git.isBinaryObject.mockResolvedValue(true);

        const {fileInfo} = await import('../RepositoryInfo');
        expect(
            await fileInfo(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(
                    true, '', {
                        exists: true, isBinary: true,
                    },
                )));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            name: fakeRepository.name,
        }]);
        expect(functionMock.Git.objectExists.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeFilePath, fakeCommitHash,
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeFilePath, fakeCommitHash,
        ]);
        expect(functionMock.Git.isBinaryObject.mock.calls.pop()).toEqual([
            fakeRepositoryPath, fakeObjectHash,
        ]);
        expect(functionMock.Git.getObjectSize.mock.calls.length).toBe(0);
    });
});

describe(rawFile, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeObjectHash = faker.random.alphaNumeric(64);
    const fakeFilePath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeCommitHash = faker.random.alphaNumeric(64);
    const fakeReadableStream = new Readable();

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        functionMock.Git.getObjectHash.mockResolvedValue(fakeObjectHash);
        functionMock.Git.getObjectReadStream.mockReturnValue(fakeReadableStream);

    });

    it('everyone can get the raw file read stream of a public repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockResolvedValue(true);
        const {rawFile} = await import('../RepositoryInfo');
        expect(
            await rawFile(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(200,
            {'Content-Type': mime.contentType(fakeFilePath) || 'application/octet-stream'},
            fakeReadableStream));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([
            [fakeRepositoryPath, fakeFilePath, fakeCommitHash],
        ]);
        expect(functionMock.Git.getObjectReadStream.mock.calls).toEqual([
            [fakeRepositoryPath, fakeObjectHash],
        ]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([
            [fakeRepositoryPath, fakeFilePath, fakeCommitHash],
        ]);
    });

    it('only owner can get the raw file read stream of a private repository', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockResolvedValue(true);
        const {rawFile} = await import('../RepositoryInfo');
        expect(
            await rawFile(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {}));

        expect(
            await rawFile(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(200,
            {'Content-Type': mime.contentType(fakeFilePath) || 'application/octet-stream'},
            fakeReadableStream));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([
            [fakeRepositoryPath, fakeFilePath, fakeCommitHash],
        ]);
        expect(functionMock.Git.getObjectReadStream.mock.calls).toEqual([
            [fakeRepositoryPath, fakeObjectHash],
        ]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([
            [fakeRepositoryPath, fakeFilePath, fakeCommitHash],
        ]);
    });

    it('should check repository existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        functionMock.Git.objectExists.mockResolvedValue(true);
        const {rawFile} = await import('../RepositoryInfo');
        expect(
            await rawFile(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {}));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([]);
        expect(functionMock.Git.getObjectReadStream.mock.calls).toEqual([]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([]);
    });

    it('should check object existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockResolvedValue(false);
        const {rawFile} = await import('../RepositoryInfo');
        expect(
            await rawFile(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {}));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([]);
        expect(functionMock.Git.getObjectReadStream.mock.calls).toEqual([]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([
            [fakeRepositoryPath, fakeFilePath, fakeCommitHash],
        ]);
    });

    it('should check commit hash existence', async function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockRejectedValue(new Error());
        const {rawFile} = await import('../RepositoryInfo');
        expect(
            await rawFile(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {}));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([]);
        expect(functionMock.Git.getObjectReadStream.mock.calls).toEqual([]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([
            [fakeRepositoryPath, fakeFilePath, fakeCommitHash],
        ]);
    });
});