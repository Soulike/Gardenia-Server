import {create, del, getRepositories} from '../Repository';
import {Account, Repository as RepositoryClass, Repository, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';
import {EventEmitter} from 'events';
import path from 'path';
import {InvalidSessionError} from '../../Dispatcher/Class';

describe(getRepositories, () =>
{
    const fakeAccount = new Account(faker.random.word(), faker.random.alphaNumeric(64));
    const fakeOthersSession: Session = {username: faker.random.word()} as unknown as Session;
    const fakeOwnSession: Session = {username: fakeAccount.username} as unknown as Session;
    const fakeRepositories = [
        new Repository(faker.name.firstName(), faker.random.word(), faker.lorem.sentence(), true),
        new Repository(faker.name.firstName(), faker.random.word(), faker.lorem.sentence(), false),
        new Repository(faker.name.firstName(), faker.random.word(), faker.lorem.sentence(), true),
    ];

    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should get only public repositories start and end', async function ()
    {
        const mockObject = {
            Repository: {
                select: jest.fn().mockResolvedValue(fakeRepositories),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {getRepositories} = await import('../Repository');
        const response = await getRepositories(6, 23, {} as unknown as Session);
        expect(response).toEqual(new ServiceResponse<Array<RepositoryClass>>(200, {},
            new ResponseBody<Array<RepositoryClass>>(true, '', fakeRepositories)));
        expect(mockObject.Repository.select.mock.calls.length).toBe(1);
        expect(mockObject.Repository.select.mock.calls[0][0]).toEqual({isPublic: true});
        expect(mockObject.Repository.select.mock.calls[0][1]).toBe(6);
        expect(mockObject.Repository.select.mock.calls[0][2]).toBe(23 - 6);
    });


    it('should get only public repositories with session, start and end', async function ()
    {
        const mockObject = {
            Repository: {
                select: jest.fn().mockResolvedValue(fakeRepositories),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {getRepositories} = await import('../Repository');
        const response = await getRepositories(5, 20, fakeOthersSession);
        expect(response).toEqual(new ServiceResponse<Array<RepositoryClass>>(200, {},
            new ResponseBody<Array<RepositoryClass>>(true, '', fakeRepositories)));
        expect(mockObject.Repository.select.mock.calls.length).toBe(1);
        expect(mockObject.Repository.select.mock.calls[0][0]).toEqual({isPublic: true});
        expect(mockObject.Repository.select.mock.calls[0][1]).toBe(5);
        expect(mockObject.Repository.select.mock.calls[0][2]).toBe(20 - 5);
    });

    it('should get only public repositories with account, other\'s session, start and end', async function ()
    {
        const mockObject = {
            Repository: {
                select: jest.fn().mockResolvedValue(fakeRepositories),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {getRepositories} = await import('../Repository');
        const response = await getRepositories(8, 26, fakeOthersSession, fakeAccount.username);
        expect(response).toEqual(new ServiceResponse<Array<RepositoryClass>>(200, {},
            new ResponseBody<Array<RepositoryClass>>(true, '', fakeRepositories)));
        expect(mockObject.Repository.select.mock.calls.length).toBe(1);
        expect(mockObject.Repository.select.mock.calls[0][0]).toEqual({username: fakeAccount.username, isPublic: true});
        expect(mockObject.Repository.select.mock.calls[0][1]).toBe(8);
        expect(mockObject.Repository.select.mock.calls[0][2]).toBe(26 - 8);
    });

    it('should get public and private repositories with account, own session, start and end', async function ()
    {
        const mockObject = {
            Repository: {
                select: jest.fn().mockResolvedValue(fakeRepositories),
            },
        };
        jest.mock('../../Database', () => mockObject);
        const {getRepositories} = await import('../Repository');
        const response = await getRepositories(14, 28, fakeOwnSession, fakeAccount.username);
        expect(response).toEqual(new ServiceResponse<Array<RepositoryClass>>(200, {},
            new ResponseBody<Array<RepositoryClass>>(true, '', fakeRepositories)));
        expect(mockObject.Repository.select.mock.calls.length).toBe(1);
        expect(mockObject.Repository.select.mock.calls[0][0]).toEqual({username: fakeAccount.username});
        expect(mockObject.Repository.select.mock.calls[0][1]).toBe(14);
        expect(mockObject.Repository.select.mock.calls[0][2]).toBe(28 - 14);
    });
});

describe(create, () =>
{
    const fakeRepository = new RepositoryClass(faker.random.word(), faker.name.firstName(), faker.lorem.sentence(), true);
    const fakeSession = {username: fakeRepository.username} as unknown as Session;
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());

    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should create repository', async function ()
    {
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
                insert: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                mkdir: jest.fn().mockResolvedValue(undefined),
            },
        };
        const cpMock = {
            spawn: jest.fn().mockImplementation(() =>
            {
                const event = new EventEmitter();
                setTimeout(() =>
                {
                    event.emit('exit');
                }, 0);
                return event;
            }),
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        jest.mock('child_process', () => cpMock);
        const {create} = await import('../Repository');
        const response = await create(fakeRepository, fakeSession);

        expect(response).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true)));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(fsMock.promises.mkdir.mock.calls.length).toBe(1);
        expect(fsMock.promises.mkdir.mock.calls[0][0]).toEqual(fakeRepositoryPath);
        expect(fsMock.promises.mkdir.mock.calls[0][1]).toEqual({recursive: true});

        expect(cpMock.spawn.mock.calls.length).toBe(1);
        expect(cpMock.spawn.mock.calls[0][0]).toBe('git init --bare && cp hooks/post-update.sample hooks/post-update && git update-server-info && git config http.receivepack true');
        expect(cpMock.spawn.mock.calls[0][1]).toEqual({
            shell: true,
            cwd: fakeRepositoryPath,
        });

        expect(databaseMock.Repository.insert.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.insert.mock.calls[0][0]).toEqual(fakeRepository);

        expect(fseMock.remove.mock.calls.length).toBe(0);
    });

    it('should check repository existence', async function ()
    {
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
                insert: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                mkdir: jest.fn().mockResolvedValue(undefined),
            },
        };
        const cpMock = {
            spawn: jest.fn().mockImplementation(() =>
            {
                const event = new EventEmitter();
                setTimeout(() =>
                {
                    event.emit('exit');
                }, 0);
                return event;
            }),
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        jest.mock('child_process', () => cpMock);
        const {create} = await import('../Repository');
        const response = await create(fakeRepository, fakeSession);

        expect(response).toEqual(new ServiceResponse<void>(200, {}, new ResponseBody<void>(false, '仓库已存在')));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(databaseMock.Repository.insert.mock.calls.length).toBe(0);

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);

        expect(fsMock.promises.mkdir.mock.calls.length).toBe(0);

        expect(fseMock.remove.mock.calls.length).toBe(0);

        expect(cpMock.spawn.mock.calls.length).toBe(0);
    });

    it('should check session', async function ()
    {
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
                insert: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                mkdir: jest.fn().mockResolvedValue(undefined),
            },
        };
        const cpMock = {
            spawn: jest.fn().mockImplementation(() =>
            {
                const event = new EventEmitter();
                setTimeout(() =>
                {
                    event.emit('exit');
                }, 0);
                return event;
            }),
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        jest.mock('child_process', () => cpMock);
        const {create} = await import('../Repository');

        await expect(create(fakeRepository, {} as unknown as Session)).rejects.toEqual(new InvalidSessionError());
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(0);

        expect(databaseMock.Repository.insert.mock.calls.length).toBe(0);

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);

        expect(fsMock.promises.mkdir.mock.calls.length).toBe(0);

        expect(fseMock.remove.mock.calls.length).toBe(0);

        expect(cpMock.spawn.mock.calls.length).toBe(0);
    });

    it('should process mkdir error', async function ()
    {
        const mkdirError = new Error(faker.lorem.sentence());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
                insert: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                mkdir: jest.fn().mockRejectedValue(mkdirError),
            },
        };
        const cpMock = {
            spawn: jest.fn().mockImplementation(() =>
            {
                const event = new EventEmitter();
                setTimeout(() =>
                {
                    event.emit('exit');
                }, 0);
                return event;
            }),
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        jest.mock('child_process', () => cpMock);
        const {create} = await import('../Repository');

        await expect(create(fakeRepository, fakeSession)).rejects.toThrow(mkdirError);

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(fsMock.promises.mkdir.mock.calls.length).toBe(1);
        expect(fsMock.promises.mkdir.mock.calls[0][0]).toEqual(fakeRepositoryPath);
        expect(fsMock.promises.mkdir.mock.calls[0][1]).toEqual({recursive: true});

        expect(cpMock.spawn.mock.calls.length).toBe(0);

        expect(fseMock.remove.mock.calls.length).toBe(1);
        expect(fseMock.remove.mock.calls[0][0]).toEqual(fakeRepositoryPath);

        expect(databaseMock.Repository.insert.mock.calls.length).toBe(0);
    });

    it('should process command error', async function ()
    {
        const commandError = new Error(faker.lorem.sentence());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
                insert: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                mkdir: jest.fn().mockResolvedValue(undefined),
            },
        };
        const cpMock = {
            spawn: jest.fn().mockImplementation(() =>
            {
                const event = new EventEmitter();
                setTimeout(() =>
                {
                    event.emit('error', commandError);
                }, 0);
                return event;
            }),
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        jest.mock('child_process', () => cpMock);
        const {create} = await import('../Repository');

        await expect(create(fakeRepository, fakeSession)).rejects.toThrow(commandError);

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(fsMock.promises.mkdir.mock.calls.length).toBe(1);
        expect(fsMock.promises.mkdir.mock.calls[0][0]).toEqual(fakeRepositoryPath);
        expect(fsMock.promises.mkdir.mock.calls[0][1]).toEqual({recursive: true});

        expect(cpMock.spawn.mock.calls.length).toBe(1);
        expect(cpMock.spawn.mock.calls[0][0]).toBe('git init --bare && cp hooks/post-update.sample hooks/post-update && git update-server-info && git config http.receivepack true');
        expect(cpMock.spawn.mock.calls[0][1]).toEqual({
            shell: true,
            cwd: fakeRepositoryPath,
        });

        expect(fseMock.remove.mock.calls.length).toBe(1);
        expect(fseMock.remove.mock.calls[0][0]).toEqual(fakeRepositoryPath);

        expect(databaseMock.Repository.insert.mock.calls.length).toBe(0);
    });

    it('should process database insert error', async function ()
    {
        const insertError = new Error(faker.lorem.sentence());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
                insert: jest.fn().mockRejectedValue(insertError),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                mkdir: jest.fn().mockResolvedValue(undefined),
            },
        };
        const cpMock = {
            spawn: jest.fn().mockImplementation(() =>
            {
                const event = new EventEmitter();
                setTimeout(() =>
                {
                    event.emit('exit');
                }, 0);
                return event;
            }),
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        jest.mock('child_process', () => cpMock);
        const {create} = await import('../Repository');

        await expect(create(fakeRepository, fakeSession)).rejects.toThrow(insertError);

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(fsMock.promises.mkdir.mock.calls.length).toBe(1);
        expect(fsMock.promises.mkdir.mock.calls[0][0]).toEqual(fakeRepositoryPath);
        expect(fsMock.promises.mkdir.mock.calls[0][1]).toEqual({recursive: true});

        expect(cpMock.spawn.mock.calls.length).toBe(1);
        expect(cpMock.spawn.mock.calls[0][0]).toBe('git init --bare && cp hooks/post-update.sample hooks/post-update && git update-server-info && git config http.receivepack true');
        expect(cpMock.spawn.mock.calls[0][1]).toEqual({
            shell: true,
            cwd: fakeRepositoryPath,
        });

        expect(fseMock.remove.mock.calls.length).toBe(1);
        expect(fseMock.remove.mock.calls[0][0]).toEqual(fakeRepositoryPath);

        expect(databaseMock.Repository.insert.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.insert.mock.calls[0][0]).toEqual(fakeRepository);
    });

    it('should not throw error created by fse.remove', async function ()
    {
        const mkdirError = new Error(faker.lorem.sentence());
        const removeError = new Error(faker.lorem.sentence());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
                insert: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            remove: jest.fn().mockRejectedValue(removeError),
        };
        const fsMock = {
            promises: {
                mkdir: jest.fn().mockRejectedValue(mkdirError),
            },
        };
        const cpMock = {
            spawn: jest.fn().mockImplementation(() =>
            {
                const event = new EventEmitter();
                setTimeout(() =>
                {
                    event.emit('exit');
                }, 0);
                return event;
            }),
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        jest.mock('child_process', () => cpMock);
        const {create} = await import('../Repository');

        await expect(create(fakeRepository, fakeSession)).rejects.toThrow(mkdirError);

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(fsMock.promises.mkdir.mock.calls.length).toBe(1);
        expect(fsMock.promises.mkdir.mock.calls[0][0]).toEqual(fakeRepositoryPath);
        expect(fsMock.promises.mkdir.mock.calls[0][1]).toEqual({recursive: true});

        expect(cpMock.spawn.mock.calls.length).toBe(0);

        expect(fseMock.remove.mock.calls.length).toBe(1);
        expect(fseMock.remove.mock.calls[0][0]).toEqual(fakeRepositoryPath);

        expect(databaseMock.Repository.insert.mock.calls.length).toBe(0);
    });
});

describe(del, () =>
{
    const fakeRepository = new RepositoryClass(faker.random.word(), faker.name.firstName(), faker.lorem.sentence(), true);
    const fakeSession = {username: fakeRepository.username} as unknown as Session;
    const tempPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    beforeEach(() =>
    {
        jest.resetModules();
    });

    it('should delete repository', async function ()
    {
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
                deleteByUsernameAndName: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                rename: jest.fn().mockResolvedValue(undefined),
                mkdtemp: jest.fn().mockResolvedValue(tempPath),
            },
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        const {del} = await import('../Repository');
        const response = await del(fakeRepository, fakeSession);

        expect(response).toEqual(new ServiceResponse<void>(200, {},
            new ResponseBody<void>(true)));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeSession.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(fsMock.promises.mkdtemp.mock.calls.length).toBe(1);

        expect(fsMock.promises.rename.mock.calls.length).toBe(1);
        expect(fsMock.promises.rename.mock.calls[0][0]).toBe(fakeRepositoryPath);
        expect(fsMock.promises.rename.mock.calls[0][1]).toBe(tempPath);

        expect(databaseMock.Repository.deleteByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.deleteByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeSession.username,
            name: fakeRepository.name,
        });

        expect(fseMock.remove.mock.calls.length).toBe(1);
        expect(fseMock.remove.mock.calls[0][0]).toBe(tempPath);
    });

    it('should check session', async function ()
    {
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
                deleteByUsernameAndName: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                rename: jest.fn().mockResolvedValue(undefined),
                mkdtemp: jest.fn().mockResolvedValue(tempPath),
            },
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        const {del} = await import('../Repository');

        await expect(del(fakeRepository, {} as unknown as Session)).rejects.toEqual(new InvalidSessionError());

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(0);

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);

        expect(fsMock.promises.mkdtemp.mock.calls.length).toBe(0);

        expect(fsMock.promises.rename.mock.calls.length).toBe(0);

        expect(databaseMock.Repository.deleteByUsernameAndName.mock.calls.length).toBe(0);

        expect(fseMock.remove.mock.calls.length).toBe(0);
    });

    it('should check repository existence', async function ()
    {
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(null),
                deleteByUsernameAndName: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                rename: jest.fn().mockResolvedValue(undefined),
                mkdtemp: jest.fn().mockResolvedValue(tempPath),
            },
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        const {del} = await import('../Repository');
        const response = await del(fakeRepository, fakeSession);

        expect(response).toEqual(new ServiceResponse<void>(404, {}, new ResponseBody<void>(false, '仓库不存在')));

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeSession.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(0);

        expect(fsMock.promises.mkdtemp.mock.calls.length).toBe(0);

        expect(fsMock.promises.rename.mock.calls.length).toBe(0);

        expect(databaseMock.Repository.deleteByUsernameAndName.mock.calls.length).toBe(0);

        expect(fseMock.remove.mock.calls.length).toBe(0);
    });

    it('should process directory moving error', async function ()
    {
        const movingError = new Error(faker.lorem.sentence());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
                deleteByUsernameAndName: jest.fn().mockResolvedValue(undefined),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                rename: jest.fn().mockRejectedValue(movingError),
                mkdtemp: jest.fn().mockResolvedValue(tempPath),
            },
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        const {del} = await import('../Repository');

        await expect(del(fakeRepository, fakeSession)).rejects.toThrow(movingError);

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeSession.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(fsMock.promises.mkdtemp.mock.calls.length).toBe(1);

        expect(fsMock.promises.rename.mock.calls.length).toBe(1);
        expect(fsMock.promises.rename.mock.calls[0][0]).toBe(fakeRepositoryPath);
        expect(fsMock.promises.rename.mock.calls[0][1]).toBe(tempPath);

        expect(databaseMock.Repository.deleteByUsernameAndName.mock.calls.length).toBe(0);

        expect(fseMock.remove.mock.calls.length).toBe(0);
    });

    it('should process database delete error', async function ()
    {
        const deleteError = new Error(faker.lorem.sentence());
        const databaseMock = {
            Repository: {
                selectByUsernameAndName: jest.fn().mockResolvedValue(fakeRepository),
                deleteByUsernameAndName: jest.fn().mockRejectedValue(deleteError),
            },
        };
        const fseMock = {
            remove: jest.fn().mockResolvedValue(undefined),
        };
        const fsMock = {
            promises: {
                rename: jest.fn().mockResolvedValue(undefined),
                mkdtemp: jest.fn().mockResolvedValue(tempPath),
            },
        };
        const functionMock = {
            Git: {
                generateRepositoryPath: jest.fn().mockReturnValue(fakeRepositoryPath),
            },
        };
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        const {del} = await import('../Repository');

        await expect(del(fakeRepository, fakeSession)).rejects.toThrow(deleteError);

        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.selectByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeSession.username,
            name: fakeRepository.name,
        });

        expect(functionMock.Git.generateRepositoryPath.mock.calls.length).toBe(1);
        expect(functionMock.Git.generateRepositoryPath.mock.calls[0][0]).toEqual({
            username: fakeRepository.username,
            name: fakeRepository.name,
        });

        expect(fsMock.promises.mkdtemp.mock.calls.length).toBe(1);

        expect(fsMock.promises.rename.mock.calls.length).toBe(2);
        expect(fsMock.promises.rename.mock.calls[0][0]).toBe(fakeRepositoryPath);
        expect(fsMock.promises.rename.mock.calls[0][1]).toBe(tempPath);
        expect(fsMock.promises.rename.mock.calls[1][0]).toBe(tempPath);
        expect(fsMock.promises.rename.mock.calls[1][1]).toBe(fakeRepositoryPath);

        expect(databaseMock.Repository.deleteByUsernameAndName.mock.calls.length).toBe(1);
        expect(databaseMock.Repository.deleteByUsernameAndName.mock.calls[0][0]).toEqual({
            username: fakeSession.username,
            name: fakeRepository.name,
        });

        expect(fseMock.remove.mock.calls.length).toBe(0);
    });
});