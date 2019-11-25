import {create, del, getRepositories} from '../Repository';
import {Account, Repository as RepositoryClass, Repository, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';
import {EventEmitter} from 'events';
import path from 'path';
import {InvalidSessionError} from '../../Dispatcher/Class';
import {Repository as RepositoryTable} from '../../Database';
import {Git} from '../../Function';
import fs from 'fs';

const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());

const databaseMock = {
    Repository: {
        select: jest.fn<ReturnType<typeof RepositoryTable.select>,
            Parameters<typeof RepositoryTable.select>>(),
        insert: jest.fn<ReturnType<typeof RepositoryTable.insert>,
            Parameters<typeof RepositoryTable.insert>>(),
        selectByUsernameAndName: jest.fn<ReturnType<typeof RepositoryTable.selectByUsernameAndName>,
            Parameters<typeof RepositoryTable.selectByUsernameAndName>>(),
        deleteByUsernameAndName: jest.fn<ReturnType<typeof RepositoryTable.deleteByUsernameAndName>,
            Parameters<typeof RepositoryTable.deleteByUsernameAndName>>(),
    },
};

const fseMock = {
    remove: jest.fn(),  // can not use template parameters due to TypeScript limitations on overloads
};

const fsMock = {
    promises: {
        mkdir: jest.fn<ReturnType<typeof fs.promises.mkdir>, Parameters<typeof fs.promises.mkdir>>(),
        rename: jest.fn<ReturnType<typeof fs.promises.rename>, Parameters<typeof fs.promises.rename>>(),
        mkdtemp: jest.fn<ReturnType<typeof fs.promises.mkdtemp>, Parameters<typeof fs.promises.mkdtemp>>(),
    },
};

const cpMock = {
    spawn: jest.fn().mockImplementation(() =>
    {
        const event = new EventEmitter();
        process.nextTick(() =>
        {
            event.emit('exit');
        });
        return event;
    }),
};

const functionMock = {
    Git: {
        generateRepositoryPath: jest.fn<ReturnType<typeof Git.generateRepositoryPath>,
            Parameters<typeof Git.generateRepositoryPath>>(),
    },
};

describe(`${getRepositories.name}`, () =>
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
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        databaseMock.Repository.select.mockResolvedValue(fakeRepositories);
    });

    it('should get only public repositories start and end', async function ()
    {
        const {getRepositories} = await import('../Repository');
        const response = await getRepositories(6, 23, {} as unknown as Session);
        expect(response).toEqual(new ServiceResponse<Array<RepositoryClass>>(200, {},
            new ResponseBody<Array<RepositoryClass>>(true, '', fakeRepositories)));
        expect(databaseMock.Repository.select.mock.calls.pop()).toEqual([
            {isPublic: true}, 6, 23 - 6,
        ]);
    });


    it('should get only public repositories with session, start and end', async function ()
    {
        const {getRepositories} = await import('../Repository');
        const response = await getRepositories(5, 20, fakeOthersSession);
        expect(response).toEqual(new ServiceResponse<Array<RepositoryClass>>(200, {},
            new ResponseBody<Array<RepositoryClass>>(true, '', fakeRepositories)));
        expect(databaseMock.Repository.select.mock.calls.pop()).toEqual([
            {isPublic: true}, 5, 20 - 5,
        ]);
    });

    it('should get only public repositories with account, other\'s session, start and end', async function ()
    {
        const {getRepositories} = await import('../Repository');
        const response = await getRepositories(8, 26, fakeOthersSession, fakeAccount.username);
        expect(response).toEqual(new ServiceResponse<Array<RepositoryClass>>(200, {},
            new ResponseBody<Array<RepositoryClass>>(true, '', fakeRepositories)));
        expect(databaseMock.Repository.select.mock.calls.pop()).toEqual([{
            username: fakeAccount.username,
            isPublic: true,
        }, 8, 26 - 8]);
    });

    it('should get public and private repositories with account, own session, start and end', async function ()
    {
        const {getRepositories} = await import('../Repository');
        const response = await getRepositories(14, 28, fakeOwnSession, fakeAccount.username);
        expect(response).toEqual(new ServiceResponse<Array<RepositoryClass>>(200, {},
            new ResponseBody<Array<RepositoryClass>>(true, '', fakeRepositories)));
        expect(databaseMock.Repository.select.mock.calls.pop()).toEqual([
            {username: fakeAccount.username}, 14, 28 - 14]);
    });
});

describe(`${create.name}`, () =>
{
    const fakeRepository = new RepositoryClass(faker.random.word(), faker.name.firstName(), faker.lorem.sentence(), true);
    const fakeSession = {username: fakeRepository.username} as unknown as Session;

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('child_process', () => cpMock);
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
    });

    it('should create repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        fsMock.promises.mkdir.mockResolvedValue(undefined);
        cpMock.spawn.mockImplementation(() =>
        {
            const event = new EventEmitter();
            process.nextTick(() =>
            {
                event.emit('exit');
            });
            return event;
        });
        databaseMock.Repository.insert.mockResolvedValue(undefined);
        fseMock.remove.mockResolvedValue(undefined);

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
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        fsMock.promises.mkdir.mockResolvedValue(undefined);
        cpMock.spawn.mockImplementation(() =>
        {
            const event = new EventEmitter();
            process.nextTick(() =>
            {
                event.emit('exit');
            });
            return event;
        });
        databaseMock.Repository.insert.mockResolvedValue(undefined);
        fseMock.remove.mockResolvedValue(undefined);
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
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        fsMock.promises.mkdir.mockResolvedValue(undefined);
        cpMock.spawn.mockImplementation(() =>
        {
            const event = new EventEmitter();
            process.nextTick(() =>
            {
                event.emit('exit');
            });
            return event;
        });
        databaseMock.Repository.insert.mockResolvedValue(undefined);
        fseMock.remove.mockResolvedValue(undefined);
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
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        fsMock.promises.mkdir.mockRejectedValue(mkdirError);
        cpMock.spawn.mockImplementation(() =>
        {
            const event = new EventEmitter();
            process.nextTick(() =>
            {
                event.emit('exit');
            });
            return event;
        });
        databaseMock.Repository.insert.mockResolvedValue(undefined);
        fseMock.remove.mockResolvedValue(undefined);
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
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        cpMock.spawn.mockImplementation(() =>
        {
            const event = new EventEmitter();
            setTimeout(() =>
            {
                event.emit('error', commandError);
            }, 0);
            return event;
        });
        fsMock.promises.mkdir.mockResolvedValue(undefined);
        databaseMock.Repository.insert.mockResolvedValue(undefined);
        fseMock.remove.mockResolvedValue(undefined);
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

        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        fsMock.promises.mkdir.mockResolvedValue(undefined);
        cpMock.spawn.mockImplementation(() =>
        {
            const event = new EventEmitter();
            process.nextTick(() =>
            {
                event.emit('exit');
            });
            return event;
        });
        fseMock.remove.mockResolvedValue(undefined);
        databaseMock.Repository.insert.mockRejectedValue(insertError);
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
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        cpMock.spawn.mockImplementation(() =>
        {
            const event = new EventEmitter();
            process.nextTick(() =>
            {
                event.emit('exit');
            });
            return event;
        });
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        fseMock.remove.mockRejectedValue(removeError);
        fsMock.promises.mkdir.mockRejectedValue(mkdirError);
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

describe(`${del.name}`, () =>
{
    const fakeRepository = new RepositoryClass(faker.random.word(), faker.name.firstName(), faker.lorem.sentence(), true);
    const fakeSession = {username: fakeRepository.username} as unknown as Session;
    const tempPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());
    const fakeRepositoryPath = path.join(faker.random.word(), faker.random.word(), faker.random.word());

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
        jest.mock('fs-extra', () => fseMock);
        jest.mock('fs', () => fsMock);
        fseMock.remove.mockResolvedValue(undefined);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        fsMock.promises.mkdtemp.mockResolvedValue(tempPath);
    });

    it('should delete repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        databaseMock.Repository.deleteByUsernameAndName.mockResolvedValue(undefined);
        fsMock.promises.rename.mockResolvedValue(undefined);
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
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        databaseMock.Repository.deleteByUsernameAndName.mockResolvedValue(undefined);
        fsMock.promises.rename.mockResolvedValue(undefined);
        jest.mock('../../Function', () => functionMock);
        jest.mock('../../Database', () => databaseMock);
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
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        databaseMock.Repository.deleteByUsernameAndName.mockResolvedValue(undefined);
        fsMock.promises.rename.mockResolvedValue(undefined);
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
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        databaseMock.Repository.deleteByUsernameAndName.mockResolvedValue(undefined);
        fsMock.promises.rename.mockRejectedValue(movingError);
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
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        databaseMock.Repository.deleteByUsernameAndName.mockRejectedValue(deleteError);
        fsMock.promises.rename.mockResolvedValue(undefined);
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