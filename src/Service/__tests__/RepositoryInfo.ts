import {
    addToGroup,
    branch,
    commitCount,
    directory,
    fileInfo,
    groups,
    lastCommit,
    rawFile,
    repository,
    setDescription,
    setIsPublic,
    setName,
} from '../RepositoryInfo';
import {Account, Commit, Group, Repository, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';
import path from 'path';
import {ObjectType} from '../../CONSTANT';
import {Group as GroupTable, Repository as RepositoryTable} from '../../Database';
import {Git, Repository as RepositoryFunction} from '../../Function';
import {Readable} from 'stream';
import mime from 'mime-types';

const databaseMock = {
    Repository: {
        selectByUsernameAndName: jest.fn<ReturnType<typeof RepositoryTable.selectByUsernameAndName>,
            Parameters<typeof RepositoryTable.selectByUsernameAndName>>(),
        update: jest.fn<ReturnType<typeof RepositoryTable.update>,
            Parameters<typeof RepositoryTable.update>>(),
        getGroupsByUsernameAndName: jest.fn<ReturnType<typeof RepositoryTable.getGroupsByUsernameAndName>,
            Parameters<typeof RepositoryTable.getGroupsByUsernameAndName>>(),
        getGroupByUsernameAndNameAndGroupId: jest.fn<ReturnType<typeof RepositoryTable.getGroupByUsernameAndNameAndGroupId>,
            Parameters<typeof RepositoryTable.getGroupByUsernameAndNameAndGroupId>>(),
    },
    Group: {
        selectById: jest.fn<ReturnType<typeof GroupTable.selectById>,
            Parameters<typeof GroupTable.selectById>>(),
        getAccountsById: jest.fn<ReturnType<typeof GroupTable.getAccountsById>,
            Parameters<typeof GroupTable.getAccountsById>>(),
        addRepositories: jest.fn<ReturnType<typeof GroupTable.addRepositories>,
            Parameters<typeof GroupTable.addRepositories>>(),
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
        repositoryIsAvailableToTheViewer: jest.fn<ReturnType<typeof RepositoryFunction.repositoryIsAvailableToTheViewer>,
            Parameters<typeof RepositoryFunction.repositoryIsAvailableToTheViewer>>(),
    },
};

const fseMock = {
    copy: jest.fn(),
    remove: jest.fn(),
};

describe(`${repository.name}`, () =>
{
    const fakeAccount = new Account(
        faker.name.firstName(),
        faker.random.alphaNumeric(64),
    );

    const fakeViewer = new Account(
        faker.name.firstName(),
        faker.random.alphaNumeric(64),
    );

    const fakeRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        faker.lorem.sentence(),
        true,
    );

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
    });

    it('should return repository info when repository is available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        const {repository} = await import('../RepositoryInfo');

        expect(
            await repository(fakeAccount, fakeRepository, {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeRepository)));
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
    });

    it('should not return repository info when repository is not available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        const {repository} = await import('../RepositoryInfo');

        expect(
            await repository(fakeAccount, fakeRepository, {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
    });
});

describe(`${branch.name}`, () =>
{
    const fakeAccount = new Account(
        faker.name.firstName(),
        faker.random.alphaNumeric(64),
    );
    const fakeViewer = new Account(
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
    const fakeRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        faker.lorem.sentence(),
        true,
    );

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

    it('should return repository branches when repository is available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        const {branch} = await import('../RepositoryInfo');
        expect(
            await branch(fakeAccount, fakeRepository, {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeBranches)));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeRepository.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Git.getAllBranches.mock.calls).toEqual([
            [fakeRepositoryPath],
        ]);
        expect(functionMock.Git.putMasterBranchToFront.mock.calls).toEqual([
            [fakeBranches, 'master'],
        ]);
    });

    it('should not return repository branches when repository is not available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        const {branch} = await import('../RepositoryInfo');

        expect(
            await branch(fakeAccount, fakeRepository, {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([]);
        expect(functionMock.Git.getAllBranches.mock.calls).toEqual([]);
        expect(functionMock.Git.putMasterBranchToFront.mock.calls).toEqual([]);
    });
});

describe(`${lastCommit.name}`, () =>
{
    const fakeAccount = new Account(
        faker.name.firstName(),
        faker.random.alphaNumeric(64),
    );
    const fakeViewer = new Account(
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
    const fakeRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        faker.lorem.sentence(),
        true,
    );

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
    });

    it('should return repository last commit when repository is available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getLastCommitInfo.mockResolvedValue(fakeCommit);
        const {lastCommit} = await import('../RepositoryInfo');

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: fakeViewer.username} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeCommit)));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeRepository.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Git.getLastCommitInfo.mock.calls).toEqual([
            [fakeRepositoryPath, fakeCommit.commitHash, fakeFilePath],
        ]);
    });

    it('should not return repository last commit when repository is not available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getLastCommitInfo.mockResolvedValue(fakeCommit);
        const {lastCommit} = await import('../RepositoryInfo');

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: fakeViewer.username} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([]);
        expect(functionMock.Git.getLastCommitInfo.mock.calls).toEqual([]);
    });

    it(`should handle reject from ${Git.getLastCommitInfo.name}`, async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getLastCommitInfo.mockRejectedValue(new Error());
        const {lastCommit} = await import('../RepositoryInfo');

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: fakeViewer.username} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '分支或文件不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeRepository.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Git.getLastCommitInfo.mock.calls).toEqual([
            [fakeRepositoryPath, fakeCommit.commitHash, fakeFilePath],
        ]);
    });
});

describe(`${directory.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeViewer = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
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
    const fakeRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        faker.lorem.sentence(),
        true,
    );

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

    it('should return repository directory info when repository is available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getFileCommitInfoList.mockResolvedValue([...sortedCommitInfoListCopy]);
        const {directory} = await import('../RepositoryInfo');

        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse(
            200,
            {},
            new ResponseBody(
                true,
                '',
                sortedCommitInfoListCopy,
            ),
        ));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeRepository.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Git.getFileCommitInfoList.mock.calls).toEqual([
            [
                fakeRepositoryPath,
                fakeCommitHash,
                fakeDirectoryPath,
            ],
        ]);
    });

    it('should not return repository directory info when repository is available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getFileCommitInfoList.mockResolvedValue([...sortedCommitInfoListCopy]);
        const {directory} = await import('../RepositoryInfo');
        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(
            404,
            {},
            new ResponseBody<void>(
                false,
                '仓库不存在',
            ),
        ));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([]);
        expect(functionMock.Git.getFileCommitInfoList.mock.calls).toEqual([]);
    });

    it('should check directory path existence', async function ()
    {
        const fakeError = new Error(faker.lorem.sentence());

        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getFileCommitInfoList.mockRejectedValue(fakeError);
        const {directory} = await import('../RepositoryInfo');
        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(
            404,
            {},
            new ResponseBody<void>(
                false,
                '文件不存在',
            ),
        ));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeRepository.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Git.getFileCommitInfoList.mock.calls).toEqual([
            [
                fakeRepositoryPath,
                fakeCommitHash,
                fakeDirectoryPath,
            ],
        ]);
    });

    it('should sort directory content array', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getFileCommitInfoList.mockResolvedValue([...fakeCommitInfoList]);
        const {directory} = await import('../RepositoryInfo');
        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }>>(
            200,
            {},
            new ResponseBody<Array<{ type: ObjectType, path: string, commit: Commit }>>(
                true,
                '',
                sortedCommitInfoListCopy,
            ),
        ));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeRepository.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Git.getFileCommitInfoList.mock.calls).toEqual([
            [
                fakeRepositoryPath,
                fakeCommitHash,
                fakeDirectoryPath,
            ],
        ]);
    });
});

describe(`${commitCount.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeViewer = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeCommitCount = faker.random.number();
    const fakeCommitHash = faker.random.alphaNumeric(64);
    const fakeRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        faker.lorem.sentence(),
        true,
    );

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
    });

    it('should return repository commit count when repository is available to the viewer', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        functionMock.Git.getCommitCount.mockResolvedValue(fakeCommitCount);
        const {commitCount} = await import('../RepositoryInfo');
        expect(
            await commitCount(
                {username: fakeAccount.username},
                {name: fakeRepository.name},
                fakeCommitHash,
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse<{ commitCount: number }>(200, {},
            new ResponseBody<{ commitCount: number }>(true, '', {commitCount: fakeCommitCount})));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.getCommitCount.mock.calls).toEqual([
            [
                fakeRepositoryPath,
                fakeCommitHash,
            ],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
    });

    it('should not return repository commit count when repository is not available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getCommitCount.mockResolvedValue(fakeCommitCount);
        const {commitCount} = await import('../RepositoryInfo');
        expect(
            await commitCount(fakeAccount, fakeRepository, fakeCommitHash, {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.getCommitCount.mock.calls).toEqual([]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([]);
    });

    it('should check commit hash existence', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.getCommitCount.mockRejectedValue(new Error());
        const {commitCount} = await import('../RepositoryInfo');
        expect(
            await commitCount(
                {username: fakeAccount.username},
                {name: fakeRepository.name},
                fakeCommitHash,
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '分支或提交不存在')));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.getCommitCount.mock.calls).toEqual([
            [
                fakeRepositoryPath,
                fakeCommitHash,
            ],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
    });
});

describe(`${fileInfo.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeViewer = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeObjectHash = faker.random.alphaNumeric(64);
    const fakeObjectType = ObjectType.BLOB;
    const fakeObjectSize = faker.random.number();
    const fakeFilePath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeCommitHash = faker.random.alphaNumeric(64);
    const fakeRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        faker.lorem.sentence(),
        true,
    );

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

    it('should return repository file info when repository is available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
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
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(
                    true, '', {
                        exists: true, isBinary: false, type: fakeObjectType, size: fakeObjectSize,
                    },
                )));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([
            [
                fakeRepositoryPath, fakeFilePath, fakeCommitHash,
            ],
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([
            [
                fakeRepositoryPath, fakeFilePath, fakeCommitHash,
            ],
        ]);
        expect(functionMock.Git.isBinaryObject.mock.calls).toEqual([
            [
                fakeRepositoryPath, fakeObjectHash,
            ],
        ]);
        expect(functionMock.Git.getObjectSize.mock.calls).toEqual([
            [
                fakeRepositoryPath, fakeObjectHash,
            ],
        ]);
    });

    it('should not return repository file info when repository is not available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
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
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(
            new ServiceResponse<void>(404, {},
                new ResponseBody<void>(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([]);
        expect(functionMock.Git.isBinaryObject.mock.calls).toEqual([]);
        expect(functionMock.Git.getObjectSize.mock.calls).toEqual([]);
    });

    it('should check object existence', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
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
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(
                    true, '', {
                        exists: false,
                    },
                )));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([
            [
                fakeRepositoryPath, fakeFilePath, fakeCommitHash,
            ],
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([]);
        expect(functionMock.Git.isBinaryObject.mock.calls).toEqual([]);
        expect(functionMock.Git.getObjectSize.mock.calls).toEqual([]);
    });

    it('should check commit hash existence', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
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
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(
            new ServiceResponse(404, {},
                new ResponseBody(false, '分支或提交不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([
            [
                fakeRepositoryPath, fakeFilePath, fakeCommitHash,
            ],
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([]);
        expect(functionMock.Git.isBinaryObject.mock.calls).toEqual([]);
        expect(functionMock.Git.getObjectSize.mock.calls).toEqual([]);
    });

    it('should check whether file is binary', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
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
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(
            new ServiceResponse(200, {},
                new ResponseBody(
                    true, '', {
                        exists: true, isBinary: true,
                    },
                )));
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([
            [{
                username: fakeAccount.username,
                name: fakeRepository.name,
            }],
        ]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([
            [
                fakeRepositoryPath, fakeFilePath, fakeCommitHash,
            ],
        ]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([
            [
                fakeRepositoryPath, fakeFilePath, fakeCommitHash,
            ],
        ]);
        expect(functionMock.Git.isBinaryObject.mock.calls).toEqual([
            [
                fakeRepositoryPath, fakeObjectHash,
            ],
        ]);
        expect(functionMock.Git.getObjectSize.mock.calls).toEqual([]);
    });
});

describe(`${rawFile.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeViewer = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeObjectHash = faker.random.alphaNumeric(64);
    const fakeFilePath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeCommitHash = faker.random.alphaNumeric(64);
    const fakeReadableStream = new Readable();
    const fakeRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        faker.lorem.sentence(),
        true,
    );

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

    it('should return repository raw file stream when repository is available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockResolvedValue(true);
        const {rawFile} = await import('../RepositoryInfo');
        expect(
            await rawFile(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(200,
            {'Content-Type': mime.contentType(fakeFilePath) || 'application/octet-stream'},
            fakeReadableStream));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
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

    it('should not return repository raw file stream when repository is not available to the viewer', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockResolvedValue(true);
        const {rawFile} = await import('../RepositoryInfo');
        expect(
            await rawFile(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {}));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
        ]);
        expect(functionMock.Git.generateRepositoryPath.mock.calls).toEqual([]);
        expect(functionMock.Git.getObjectHash.mock.calls).toEqual([]);
        expect(functionMock.Git.getObjectReadStream.mock.calls).toEqual([]);
        expect(functionMock.Git.objectExists.mock.calls).toEqual([]);
    });

    it('should check object existence', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockResolvedValue(false);
        const {rawFile} = await import('../RepositoryInfo');
        expect(
            await rawFile(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {}));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
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
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.objectExists.mockRejectedValue(new Error());
        const {rawFile} = await import('../RepositoryInfo');
        expect(
            await rawFile(
                fakeAccount,
                fakeRepository,
                fakeFilePath,
                fakeCommitHash,
                {username: fakeViewer.username} as unknown as Session),
        ).toEqual(new ServiceResponse<void>(404, {}));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls).toEqual([
            [{username: fakeAccount.username, name: fakeRepository.name}],
        ]);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer.mock.calls).toEqual([
            [fakeRepository, {username: fakeViewer.username}],
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

describe(`${setName.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeOldRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeNewRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeOldRepositoryName = faker.random.word();
    const fakeNewRepositoryName = faker.random.word();
    const fakeOldRepository = new Repository(
        fakeAccount.username,
        fakeOldRepositoryName,
        faker.lorem.sentence(),
        true,
    );
    const fakeNewRepository = Repository.from({
        ...fakeOldRepository,
        name: fakeNewRepositoryName,
    });
    const fakeSession = {username: fakeAccount.username} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        jest.mock('fs-extra', () => fseMock);
        functionMock.Git.generateRepositoryPath.mockReturnValueOnce(fakeOldRepositoryPath);
        functionMock.Git.generateRepositoryPath.mockReturnValueOnce(fakeNewRepositoryPath);
    });

    it('should set repository name', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeOldRepository);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(null);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        fseMock.copy.mockResolvedValue(undefined);
        databaseMock.Repository.update.mockResolvedValue(undefined);
        fseMock.remove.mockResolvedValue(undefined);

        const {setName} = await import('../RepositoryInfo');
        expect(
            await setName(
                {name: fakeOldRepositoryName},
                {name: fakeNewRepositoryName},
                fakeSession),
        ).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true)));

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(2);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(1, {
                username: fakeAccount.username, name: fakeOldRepositoryName,
            });
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(2, {
                username: fakeAccount.username, name: fakeNewRepositoryName,
            });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeOldRepository, fakeSession);

        expect(fseMock.copy).toBeCalledTimes(1);
        expect(fseMock.copy).toBeCalledWith(
            fakeOldRepositoryPath, fakeNewRepositoryPath, {
                overwrite: false,
                errorOnExist: true,
                preserveTimestamps: true,
            },
        );

        expect(databaseMock.Repository.update).toBeCalledTimes(1);
        expect(databaseMock.Repository.update).toBeCalledWith(
            {name: fakeNewRepositoryName},
            {username: fakeAccount.username, name: fakeOldRepositoryName},
        );

        expect(fseMock.remove).toBeCalledTimes(1);
        expect(fseMock.remove).toBeCalledWith(fakeOldRepositoryPath);
    });

    it('should handle inaccessible repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeOldRepository);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(null);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
        fseMock.copy.mockResolvedValue(undefined);
        databaseMock.Repository.update.mockResolvedValue(undefined);
        fseMock.remove.mockResolvedValue(undefined);

        const {setName} = await import('../RepositoryInfo');
        expect(
            await setName(
                {name: fakeOldRepositoryName},
                {name: fakeNewRepositoryName},
                fakeSession),
        ).toEqual(new ServiceResponse<void>(404, {},
            new ResponseBody<void>(false, '仓库不存在')));

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledWith({
                username: fakeAccount.username, name: fakeOldRepositoryName,
            });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeOldRepository, fakeSession);

        expect(fseMock.copy).toBeCalledTimes(0);

        expect(databaseMock.Repository.update).toBeCalledTimes(0);

        expect(fseMock.remove).toBeCalledTimes(0);
    });

    it('should handle duplicate repository name', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeOldRepository);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeNewRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        fseMock.copy.mockResolvedValue(undefined);
        databaseMock.Repository.update.mockResolvedValue(undefined);
        fseMock.remove.mockResolvedValue(undefined);

        const {setName} = await import('../RepositoryInfo');
        expect(
            await setName(
                {name: fakeOldRepositoryName},
                {name: fakeNewRepositoryName},
                fakeSession),
        ).toEqual(new ServiceResponse<void>(403, {},
            new ResponseBody<void>(false, '仓库名已存在')));

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(2);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(1, {
                username: fakeAccount.username, name: fakeOldRepositoryName,
            });
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(2, {
                username: fakeAccount.username, name: fakeNewRepositoryName,
            });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeOldRepository, fakeSession);

        expect(fseMock.copy).toBeCalledTimes(0);

        expect(databaseMock.Repository.update).toBeCalledTimes(0);

        expect(fseMock.remove).toBeCalledTimes(0);
    });

    it('should handle repository file copying error', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeOldRepository);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(null);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        fseMock.copy.mockRejectedValue(new Error());
        databaseMock.Repository.update.mockResolvedValue(undefined);
        fseMock.remove.mockResolvedValue(undefined);

        const {setName} = await import('../RepositoryInfo');
        await expect(setName(
            {name: fakeOldRepositoryName},
            {name: fakeNewRepositoryName},
            fakeSession),
        ).rejects.toThrow();

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(2);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(1, {
                username: fakeAccount.username, name: fakeOldRepositoryName,
            });
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(2, {
                username: fakeAccount.username, name: fakeNewRepositoryName,
            });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeOldRepository, fakeSession);

        expect(fseMock.copy).toBeCalledTimes(1);
        expect(fseMock.copy).toBeCalledWith(
            fakeOldRepositoryPath, fakeNewRepositoryPath, {
                overwrite: false,
                errorOnExist: true,
                preserveTimestamps: true,
            },
        );

        expect(databaseMock.Repository.update).toBeCalledTimes(0);

        expect(fseMock.remove).toBeCalledTimes(1);
        expect(fseMock.remove).toBeCalledWith(fakeNewRepositoryPath);
    });

    it('should handle database updating error', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(fakeOldRepository);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValueOnce(null);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        fseMock.copy.mockResolvedValue(undefined);
        databaseMock.Repository.update.mockRejectedValue(new Error());
        fseMock.remove.mockResolvedValue(undefined);

        const {setName} = await import('../RepositoryInfo');
        await expect(setName(
            {name: fakeOldRepositoryName},
            {name: fakeNewRepositoryName},
            fakeSession),
        ).rejects.toThrow();

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(2);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(1, {
                username: fakeAccount.username, name: fakeOldRepositoryName,
            });
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toHaveBeenNthCalledWith(2, {
                username: fakeAccount.username, name: fakeNewRepositoryName,
            });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeOldRepository, fakeSession);

        expect(fseMock.copy).toBeCalledTimes(1);
        expect(fseMock.copy).toBeCalledWith(
            fakeOldRepositoryPath, fakeNewRepositoryPath, {
                overwrite: false,
                errorOnExist: true,
                preserveTimestamps: true,
            },
        );

        expect(databaseMock.Repository.update).toBeCalledTimes(1);
        expect(databaseMock.Repository.update).toBeCalledWith(
            {name: fakeNewRepositoryName},
            {username: fakeAccount.username, name: fakeOldRepositoryName},
        );

        expect(fseMock.remove).toBeCalledTimes(1);
        expect(fseMock.remove).toBeCalledWith(fakeNewRepositoryPath);
    });
});

describe(`${setDescription.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeOldRepositoryDescription = faker.lorem.sentence();
    const fakeNewRepositoryDescription = faker.lorem.sentence();
    const fakeOldRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        fakeOldRepositoryDescription,
        true,
    );
    const fakeSession = {username: fakeAccount.username} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Repository.update.mockResolvedValue(undefined);
    });

    it('should set description', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeOldRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        const {setDescription} = await import('../RepositoryInfo');
        expect(
            await setDescription(
                {name: fakeOldRepository.name, description: fakeNewRepositoryDescription},
                fakeSession),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledWith({username: fakeAccount.username, name: fakeOldRepository.name});

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeOldRepository, fakeSession);

        expect(databaseMock.Repository.update)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.update)
            .toBeCalledWith(
                {description: fakeNewRepositoryDescription},
                {username: fakeAccount.username, name: fakeOldRepository.name});
    });

    it('should handle inaccessible repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeOldRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
        const {setDescription} = await import('../RepositoryInfo');
        expect(
            await setDescription(
                {name: fakeOldRepository.name, description: fakeNewRepositoryDescription},
                fakeSession),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledWith({username: fakeAccount.username, name: fakeOldRepository.name});

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeOldRepository, fakeSession);

        expect(databaseMock.Repository.update)
            .toBeCalledTimes(0);
    });
});

describe(`${setIsPublic.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeOldRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        faker.lorem.sentence(),
        true,
    );
    const fakeNewRepository = Repository.from({
        ...fakeOldRepository,
        isPublic: false,
    });
    const fakeSession = {username: fakeAccount.username} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Repository.update.mockResolvedValue(undefined);
    });

    it('should set isPublic', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeOldRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        const {setIsPublic} = await import('../RepositoryInfo');
        expect(
            await setIsPublic(
                {name: fakeOldRepository.name, isPublic: fakeNewRepository.isPublic},
                fakeSession),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledWith({username: fakeAccount.username, name: fakeOldRepository.name});

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeOldRepository, fakeSession);

        expect(databaseMock.Repository.update)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.update)
            .toBeCalledWith(
                {isPublic: fakeNewRepository.isPublic},
                {username: fakeAccount.username, name: fakeOldRepository.name});
    });

    it('should handle inaccessible repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeOldRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
        const {setIsPublic} = await import('../RepositoryInfo');
        expect(
            await setIsPublic(
                {name: fakeOldRepository.name, isPublic: fakeNewRepository.isPublic},
                fakeSession),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledWith({username: fakeAccount.username, name: fakeOldRepository.name});

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeOldRepository, fakeSession);

        expect(databaseMock.Repository.update)
            .toBeCalledTimes(0);
    });
});

describe(`${groups.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        faker.lorem.sentence(),
        true,
    );
    const fakeGroups = [
        new Group(faker.random.number(), faker.random.word()),
        new Group(faker.random.number(), faker.random.word()),
    ];
    const fakeSession = {username: fakeAccount.username} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Repository.getGroupsByUsernameAndName.mockResolvedValue(fakeGroups);
    });

    it('should get groups', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);

        const {groups} = await import('../RepositoryInfo');
        expect(
            await groups(
                {username: fakeRepository.username, name: fakeRepository.name},
                fakeSession),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeGroups)));

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledWith({username: fakeRepository.username, name: fakeRepository.name});

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeRepository, fakeSession);

        expect(databaseMock.Repository.getGroupsByUsernameAndName)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.getGroupsByUsernameAndName)
            .toBeCalledWith({username: fakeRepository.username, name: fakeRepository.name});
    });

    it('should handle inaccessible repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);

        const {groups} = await import('../RepositoryInfo');
        expect(
            await groups(
                {username: fakeRepository.username, name: fakeRepository.name},
                fakeSession),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));

        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledWith({username: fakeRepository.username, name: fakeRepository.name});

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeRepository, fakeSession);

        expect(databaseMock.Repository.getGroupsByUsernameAndName)
            .toBeCalledTimes(0);
    });
});

describe(`${addToGroup.name}`, () =>
{
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeRepository = new Repository(
        fakeAccount.username,
        faker.random.word(),
        faker.lorem.sentence(),
        true,
    );
    const fakeGroup = new Group(faker.random.number(), faker.random.word());
    const fakeSession = {username: fakeAccount.username} as unknown as Session;
    const fakeOthersSession = {username: faker.random.word()} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        databaseMock.Group.addRepositories.mockResolvedValue(undefined);
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
    });

    it('should add repository to group', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Group.selectById.mockResolvedValue(fakeGroup);
        databaseMock.Repository.getGroupByUsernameAndNameAndGroupId.mockResolvedValue(null);
        databaseMock.Group.getAccountsById.mockResolvedValue([fakeAccount]);

        const {addToGroup} = await import('../RepositoryInfo');
        expect(await addToGroup(
            {username: fakeAccount.username, name: fakeRepository.name},
            {id: fakeGroup.id},
            fakeSession)).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true)));

        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({
            username: fakeAccount.username, name: fakeRepository.name,
        });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledWith(
            fakeRepository, fakeSession,
        );

        expect(databaseMock.Group.selectById).toBeCalledTimes(1);
        expect(databaseMock.Group.selectById).toBeCalledWith(fakeGroup.id);

        expect(databaseMock.Repository.getGroupByUsernameAndNameAndGroupId).toBeCalledTimes(1);
        expect(databaseMock.Repository.getGroupByUsernameAndNameAndGroupId).toBeCalledWith({
            username: fakeAccount.username, name: fakeRepository.name,
        }, {id: fakeGroup.id});

        expect(databaseMock.Group.getAccountsById).toBeCalledTimes(1);
        expect(databaseMock.Group.getAccountsById).toBeCalledWith(fakeGroup.id);

        expect(databaseMock.Group.addRepositories).toBeCalledTimes(1);
        expect(databaseMock.Group.addRepositories).toBeCalledWith(fakeGroup.id, [{
            username: fakeAccount.username, name: fakeRepository.name,
        }]);
    });

    it('should handle inaccessible repository', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(false);
        databaseMock.Group.selectById.mockResolvedValue(fakeGroup);
        databaseMock.Repository.getGroupByUsernameAndNameAndGroupId.mockResolvedValue(null);
        databaseMock.Group.getAccountsById.mockResolvedValue([fakeAccount]);

        const {addToGroup} = await import('../RepositoryInfo');
        expect(await addToGroup(
            {username: fakeAccount.username, name: fakeRepository.name},
            {id: fakeGroup.id},
            fakeSession)).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));

        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({
            username: fakeAccount.username, name: fakeRepository.name,
        });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledWith(
            fakeRepository, fakeSession,
        );

        expect(databaseMock.Group.selectById).toBeCalledTimes(0);
        expect(databaseMock.Repository.getGroupByUsernameAndNameAndGroupId).toBeCalledTimes(0);
        expect(databaseMock.Group.getAccountsById).toBeCalledTimes(0);
        expect(databaseMock.Group.addRepositories).toBeCalledTimes(0);
    });

    it('should handle nonexistent group', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Group.selectById.mockResolvedValue(null);
        databaseMock.Repository.getGroupByUsernameAndNameAndGroupId.mockResolvedValue(null);
        databaseMock.Group.getAccountsById.mockResolvedValue([fakeAccount]);

        const {addToGroup} = await import('../RepositoryInfo');
        expect(await addToGroup(
            {username: fakeAccount.username, name: fakeRepository.name},
            {id: fakeGroup.id},
            fakeSession)).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '小组不存在')));

        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({
            username: fakeAccount.username, name: fakeRepository.name,
        });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledWith(
            fakeRepository, fakeSession,
        );

        expect(databaseMock.Group.selectById).toBeCalledTimes(1);
        expect(databaseMock.Group.selectById).toBeCalledWith(fakeGroup.id);

        expect(databaseMock.Repository.getGroupByUsernameAndNameAndGroupId).toBeCalledTimes(0);
        expect(databaseMock.Group.getAccountsById).toBeCalledTimes(0);
        expect(databaseMock.Group.addRepositories).toBeCalledTimes(0);
    });

    it('should handle request that add repeated repository to group', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Group.selectById.mockResolvedValue(fakeGroup);
        databaseMock.Repository.getGroupByUsernameAndNameAndGroupId.mockResolvedValue(fakeGroup);
        databaseMock.Group.getAccountsById.mockResolvedValue([fakeAccount]);

        const {addToGroup} = await import('../RepositoryInfo');
        expect(await addToGroup(
            {username: fakeAccount.username, name: fakeRepository.name},
            {id: fakeGroup.id},
            fakeSession)).toEqual(new ServiceResponse(403, {},
            new ResponseBody(false, '仓库已在小组中')));

        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({
            username: fakeAccount.username, name: fakeRepository.name,
        });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledWith(
            fakeRepository, fakeSession,
        );

        expect(databaseMock.Group.selectById).toBeCalledTimes(1);
        expect(databaseMock.Group.selectById).toBeCalledWith(fakeGroup.id);

        expect(databaseMock.Repository.getGroupByUsernameAndNameAndGroupId).toBeCalledTimes(1);
        expect(databaseMock.Repository.getGroupByUsernameAndNameAndGroupId).toBeCalledWith({
            username: fakeAccount.username, name: fakeRepository.name,
        }, {id: fakeGroup.id});

        expect(databaseMock.Group.getAccountsById).toBeCalledTimes(0);
        expect(databaseMock.Group.addRepositories).toBeCalledTimes(0);
    });

    it('should handle request from session with insufficient permission', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Group.selectById.mockResolvedValue(fakeGroup);
        databaseMock.Repository.getGroupByUsernameAndNameAndGroupId.mockResolvedValue(null);
        databaseMock.Group.getAccountsById.mockResolvedValue([fakeAccount]);

        const {addToGroup} = await import('../RepositoryInfo');
        // 传入他人的会话对象，只有会话人和仓库所有者是同一个人才有权限
        expect(await addToGroup(
            {username: fakeAccount.username, name: fakeRepository.name},
            {id: fakeGroup.id},
            fakeOthersSession)).toEqual(new ServiceResponse(403, {},
            new ResponseBody(false, '添加失败：您不是仓库的所有者')));

        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({
            username: fakeAccount.username, name: fakeRepository.name,
        });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledWith(
            fakeRepository, fakeOthersSession,
        );

        expect(databaseMock.Group.selectById).toBeCalledTimes(1);
        expect(databaseMock.Group.selectById).toBeCalledWith(fakeGroup.id);

        expect(databaseMock.Repository.getGroupByUsernameAndNameAndGroupId).toBeCalledTimes(1);
        expect(databaseMock.Repository.getGroupByUsernameAndNameAndGroupId).toBeCalledWith({
            username: fakeAccount.username, name: fakeRepository.name,
        }, {id: fakeGroup.id});

        expect(databaseMock.Group.getAccountsById).toBeCalledTimes(0);
        expect(databaseMock.Group.addRepositories).toBeCalledTimes(0);
    });

    it('should handle request from user that not belong to the group', async function ()
    {
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockReturnValue(true);
        databaseMock.Group.selectById.mockResolvedValue(fakeGroup);
        databaseMock.Repository.getGroupByUsernameAndNameAndGroupId.mockResolvedValue(null);
        databaseMock.Group.getAccountsById.mockResolvedValue([]);   // 小组里没有访问账号

        const {addToGroup} = await import('../RepositoryInfo');
        expect(await addToGroup(
            {username: fakeAccount.username, name: fakeRepository.name},
            {id: fakeGroup.id},
            fakeSession)).toEqual(new ServiceResponse(403, {},
            new ResponseBody(false, '添加失败：您不是小组的成员')));

        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({
            username: fakeAccount.username, name: fakeRepository.name,
        });

        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer).toBeCalledWith(
            fakeRepository, fakeSession,
        );

        expect(databaseMock.Group.selectById).toBeCalledTimes(1);
        expect(databaseMock.Group.selectById).toBeCalledWith(fakeGroup.id);

        expect(databaseMock.Repository.getGroupByUsernameAndNameAndGroupId).toBeCalledTimes(1);
        expect(databaseMock.Repository.getGroupByUsernameAndNameAndGroupId).toBeCalledWith({
            username: fakeAccount.username, name: fakeRepository.name,
        }, {id: fakeGroup.id});

        expect(databaseMock.Group.getAccountsById).toBeCalledTimes(1);
        expect(databaseMock.Group.getAccountsById).toBeCalledWith(fakeGroup.id);

        expect(databaseMock.Group.addRepositories).toBeCalledTimes(0);
    });
});