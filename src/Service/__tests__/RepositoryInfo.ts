import {branch, lastCommit, repository} from '../RepositoryInfo';
import {Account, Commit, Repository, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';
import path from 'path';
import {GIT} from '../../CONFIG';

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
        const mockObject = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {repository} = await import('../RepositoryInfo');
        expect(
            await repository(fakeAccount, fakeRepository, {} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeRepository)));
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });

        expect(
            await repository(fakeAccount, fakeRepository, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeRepository)));
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });

        expect(
            await repository(fakeAccount, fakeRepository, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeRepository)));
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(3);
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls[2][0]).toEqual({
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
        const mockObject = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {repository} = await import('../RepositoryInfo');
        expect(
            await repository(fakeAccount, fakeRepository, {} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });

        expect(
            await repository(fakeAccount, fakeRepository, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });

        expect(
            await repository(fakeAccount, fakeRepository, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeRepository)));
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(3);
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls[2][0]).toEqual({
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
        const mockObject = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {repository} = await import('../RepositoryInfo');
        expect(
            await repository(fakeAccount, fakeRepository, {} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(mockObject.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
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
        const repoPath = path.join(GIT.ROOT, fakeAccount.username, `${fakeRepository.name}.git`);
        const fakeBranches = [
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
        ];
        const repositoryTableMockObject = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const gitFunctionMockObject = {
            Git: {
                getBranches: jest.fn().mockResolvedValue(fakeBranches),
            },
        };
        jest.mock('../../Database', () => repositoryTableMockObject);
        jest.mock('../../Function', () => gitFunctionMockObject);
        const {branch} = await import('../RepositoryInfo');
        expect(
            await branch(fakeAccount, fakeRepository, {} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeBranches)));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getBranches.mock.calls.length).toBe(1);
        expect(gitFunctionMockObject.Git.getBranches.mock.calls[0][0]).toBe(repoPath);

        expect(
            await branch(fakeAccount, fakeRepository, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeBranches)));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getBranches.mock.calls.length).toBe(2);
        expect(gitFunctionMockObject.Git.getBranches.mock.calls[1][0]).toBe(repoPath);

        expect(
            await branch(fakeAccount, fakeRepository, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeBranches)));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(3);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[2][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getBranches.mock.calls.length).toBe(3);
        expect(gitFunctionMockObject.Git.getBranches.mock.calls[2][0]).toBe(repoPath);
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
        const repoPath = path.join(GIT.ROOT, fakeAccount.username, `${fakeRepository.name}.git`);
        const fakeBranches = [
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
            faker.random.word(),
        ];
        const repositoryTableMockObject = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const gitFunctionMockObject = {
            Git: {
                getBranches: jest.fn().mockResolvedValue(fakeBranches),
            },
        };
        jest.mock('../../Database', () => repositoryTableMockObject);
        jest.mock('../../Function', () => gitFunctionMockObject);
        const {branch} = await import('../RepositoryInfo');
        expect(
            await branch(fakeAccount, fakeRepository, {} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });

        expect(
            await branch(fakeAccount, fakeRepository, {username: faker.random.word()} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getBranches.mock.calls.length).toBe(0);

        expect(
            await branch(fakeAccount, fakeRepository, {username: fakeAccount.username} as unknown as Session),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeBranches)));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(3);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[2][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getBranches.mock.calls.length).toBe(1);
        expect(gitFunctionMockObject.Git.getBranches.mock.calls[0][0]).toBe(repoPath);
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
        const repositoryTableMockObject = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
            },
        };
        const gitFunctionMockObject = {
            Git: {
                getBranches: jest.fn().mockResolvedValue(fakeBranches),
            },
        };
        jest.mock('../../Database', () => repositoryTableMockObject);
        jest.mock('../../Function', () => gitFunctionMockObject);
        const {branch} = await import('../RepositoryInfo');
        expect(
            await branch(fakeAccount, fakeRepository, {} as unknown as Session),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getBranches.mock.calls.length).toBe(0);
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
        const repoPath = path.join(GIT.ROOT, fakeAccount.username, `${fakeRepository.name}.git`);
        const fakeFilePath = faker.random.word();
        const fakeCommit = new Commit(
            faker.random.alphaNumeric(64),
            faker.name.firstName(),
            faker.internet.email(),
            faker.date.recent().toISOString(),
            faker.lorem.sentence());
        const repositoryTableMockObject = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const gitFunctionMockObject = {
            Git: {
                getLastCommitInfo: jest.fn().mockResolvedValue(fakeCommit),
            },
        };
        jest.mock('../../Database', () => repositoryTableMockObject);
        jest.mock('../../Function', () => gitFunctionMockObject);
        const {lastCommit} = await import('../RepositoryInfo');
        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeCommit)));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls.length).toBe(1);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[0][0]).toBe(repoPath);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[0][1]).toBe(fakeCommit.commitHash);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[0][2]).toBe(fakeFilePath);

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: faker.random.word()} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeCommit)));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[1][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls.length).toBe(2);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[1][0]).toBe(repoPath);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[1][1]).toBe(fakeCommit.commitHash);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[1][2]).toBe(fakeFilePath);

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: fakeAccount.username} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeCommit)));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(3);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[2][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls.length).toBe(3);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[2][0]).toBe(repoPath);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[2][1]).toBe(fakeCommit.commitHash);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[2][2]).toBe(fakeFilePath);
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
        const repoPath = path.join(GIT.ROOT, fakeAccount.username, `${fakeRepository.name}.git`);
        const fakeFilePath = faker.random.word();
        const fakeCommit = new Commit(
            faker.random.alphaNumeric(64),
            faker.name.firstName(),
            faker.internet.email(),
            faker.date.recent().toISOString(),
            faker.lorem.sentence());
        const repositoryTableMockObject = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const gitFunctionMockObject = {
            Git: {
                getLastCommitInfo: jest.fn().mockResolvedValue(fakeCommit),
            },
        };
        jest.mock('../../Database', () => repositoryTableMockObject);
        jest.mock('../../Function', () => gitFunctionMockObject);
        const {lastCommit} = await import('../RepositoryInfo');
        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls.length).toBe(0);

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: faker.random.word()} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(2);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls.length).toBe(0);

        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {username: fakeAccount.username} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(200, {},
            new ResponseBody(true, '', fakeCommit)));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(3);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[2][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls.length).toBe(1);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[0][0]).toBe(repoPath);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[0][1]).toBe(fakeCommit.commitHash);
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls[0][2]).toBe(fakeFilePath);
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
        const repositoryTableMockObject = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
            },
        };
        const gitFunctionMockObject = {
            Git: {
                getLastCommitInfo: jest.fn().mockResolvedValue(fakeCommit),
            },
        };
        jest.mock('../../Database', () => repositoryTableMockObject);
        jest.mock('../../Function', () => gitFunctionMockObject);
        const {lastCommit} = await import('../RepositoryInfo');
        expect(
            await lastCommit(fakeAccount, fakeRepository, fakeCommit.commitHash, {} as unknown as Session, fakeFilePath),
        ).toEqual(new ServiceResponse(404, {},
            new ResponseBody(false, '仓库不存在')));
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(repositoryTableMockObject.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeAccount.username,
            name: fakeRepository.name,
        });
        expect(gitFunctionMockObject.Git.getLastCommitInfo.mock.calls.length).toBe(0);
    });
});