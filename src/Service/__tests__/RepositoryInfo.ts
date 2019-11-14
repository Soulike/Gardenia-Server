import {branch, directory, lastCommit, repository} from '../RepositoryInfo';
import {Account, Commit, Repository, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';
import path from 'path';
import {ObjectType} from '../../CONSTANT';

describe(repository, () =>
{
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('everyone can get the info of a public repository', async function ()
    {
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        jest.mock('../../Database', () => databaseMock);
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
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        jest.mock('../../Database', () => databaseMock);
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
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
            },
        };
        jest.mock('../../Database', () => databaseMock);
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
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('everyone can get the branches of a public repository', async function ()
    {
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
        const fakeBranches = [
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
        ];
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const functionMock = {
            Git: {
                getAllBranches: jest.fn().mockResolvedValue(fakeBranches),
                putMasterBranchToFront: jest.fn().mockReturnValue(fakeBranches),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
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
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
        const fakeBranches = [
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
        ];
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const functionMock = {
            Git: {
                getAllBranches: jest.fn().mockResolvedValue(fakeBranches),
                putMasterBranchToFront: jest.fn().mockReturnValue(fakeBranches),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
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
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        const fakeBranches = [
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
        ];
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
            },
        };
        const functionMock = {
            Git: {
                getAllBranches: jest.fn().mockResolvedValue(fakeBranches),
                putMasterBranchToFront: jest.fn().mockReturnValue(fakeBranches),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
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
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('everyone can get the last commit of a public repository', async function ()
    {
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
        const fakeFilePath = faker.random.word();
        const fakeCommit = new Commit(
            faker.random.alphaNumeric(64),
            faker.name.firstName(),
            faker.internet.email(),
            faker.date.recent().toISOString(),
            faker.lorem.sentence());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const functionMock = {
            Git: {
                getLastCommitInfo: jest.fn().mockResolvedValue(fakeCommit),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
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
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
        const fakeFilePath = faker.random.word();
        const fakeCommit = new Commit(
            faker.random.alphaNumeric(64),
            faker.name.firstName(),
            faker.internet.email(),
            faker.date.recent().toISOString(),
            faker.lorem.sentence());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const functionMock = {
            Git: {
                getLastCommitInfo: jest.fn().mockResolvedValue(fakeCommit),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
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
        const fakeAccount = new Account(
            faker.name.firstName(),
            faker.random.alphaNumeric(64),
        );
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        const fakeFilePath = faker.random.word();
        const fakeCommit = new Commit(
            faker.random.alphaNumeric(64),
            faker.name.firstName(),
            faker.internet.email(),
            faker.date.recent().toISOString(),
            faker.lorem.sentence());
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const functionMock = {
            Git: {
                getLastCommitInfo: jest.fn().mockResolvedValue(fakeCommit),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
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
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('everyone can get the directory info of a public repository', async function ()
    {
        const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        const fakeCommitInfo = [
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
        const fakeCommitHash = faker.random.alphaNumeric(64);
        const fakeDirectoryPath = faker.random.word();
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());

        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const functionMock = {
            Git: {
                getFileCommitInfoList: jest.fn().mockResolvedValue(fakeCommitInfo),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        const {directory} = await import('../RepositoryInfo');

        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }>>(
            200,
            {},
            new ResponseBody<Array<{ type: ObjectType, path: string, commit: Commit }>>(
                true,
                '',
                fakeCommitInfo,
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
        const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        const fakeCommitInfo = [
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
        const fakeCommitHash = faker.random.alphaNumeric(64);
        const fakeDirectoryPath = faker.random.word();
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());

        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const functionMock = {
            Git: {
                getFileCommitInfoList: jest.fn().mockResolvedValue(fakeCommitInfo),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
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
        ).toEqual(new ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }>>(
            200,
            {},
            new ResponseBody<Array<{ type: ObjectType, path: string, commit: Commit }>>(
                true,
                '',
                fakeCommitInfo,
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
        const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        const fakeCommitInfo = [
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
        const fakeCommitHash = faker.random.alphaNumeric(64);
        const fakeDirectoryPath = faker.random.word();
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
            },
        };
        const functionMock = {
            Git: {
                getFileCommitInfoList: jest.fn().mockResolvedValue(fakeCommitInfo),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
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
        const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        const fakeCommitHash = faker.random.alphaNumeric(64);
        const fakeDirectoryPath = faker.random.word();
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
        const fakeError = new Error(faker.lorem.sentence());

        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const functionMock = {
            Git: {
                getFileCommitInfoList: jest.fn().mockRejectedValue(fakeError),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
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
        const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        const fakeCommitInfo = [
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
        const fakeCommitHash = faker.random.alphaNumeric(64);
        const fakeDirectoryPath = faker.random.word();
        const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());

        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const functionMock = {
            Git: {
                getFileCommitInfoList: jest.fn().mockResolvedValue(fakeCommitInfo),
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        const {directory} = await import('../RepositoryInfo');
        fakeCommitInfo.sort((a, b) =>
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
        expect(
            await directory({username: fakeAccount.username}, {name: fakeRepository.name}, fakeCommitHash, fakeDirectoryPath, {} as unknown as Session),
        ).toEqual(new ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }>>(
            200,
            {},
            new ResponseBody<Array<{ type: ObjectType, path: string, commit: Commit }>>(
                true,
                '',
                fakeCommitInfo,
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