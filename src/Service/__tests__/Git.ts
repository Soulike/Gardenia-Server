import {Repository as RepositoryTable} from '../../Database/Table';
import {Git, Repository} from '../../Function';
import {Repository as RepositoryClass, ServiceResponse} from '../../Class';
import path from 'path';
import EventEmitter from 'events';
import mime from 'mime-types';
import {file} from '../Git';

const databaseMock = {
    Repository: {
        selectByUsernameAndName: jest.fn<ReturnType<typeof RepositoryTable.selectByUsernameAndName>,
            Parameters<typeof RepositoryTable.selectByUsernameAndName>>(),
    },
};

const functionMock = {
    Repository: {
        repositoryIsAvailableToTheRequest: jest.fn<ReturnType<typeof Repository.repositoryIsAvailableToTheRequest>,
            Parameters<typeof Repository.repositoryIsAvailableToTheRequest>>(),
    },
    Git: {
        generateRepositoryPath: jest.fn<ReturnType<typeof Git.generateRepositoryPath>,
            Parameters<typeof Git.generateRepositoryPath>>(),
    },
};

const fsMock = {
    createReadStream: jest.fn(),
};

describe(`${file.name}`, () =>
{
    const fakeRepository = new RepositoryClass('feaqfgaefg', 'faegaeg', 'gfagaeg', true);
    const fakeReadStream = new EventEmitter();
    const fakeRepositoryPath = path.join('aegaegaeg', 'hbwhwr');
    const fakeFilePath = path.join('aqegaega', 'gagaeg');
    const fakeAbsoluteFilePath = path.join(fakeRepositoryPath, fakeFilePath);
    const fakeHeaders = {afgaeg: 'gaghaeshgaes'};

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        jest.mock('fs', () => fsMock);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
    });

    it('should handle available repository request', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(true);
        fsMock.createReadStream.mockImplementation(() =>
        {
            process.nextTick(() =>
            {
                fakeReadStream.emit('ready');
            });
            return fakeReadStream;
        });
        const {username, name} = fakeRepository;
        const {file} = await import('../Git');
        const type = mime.lookup(fakeAbsoluteFilePath) || 'application/octet-stream';
        expect(
            await file({username, name}, fakeFilePath, fakeHeaders),
        ).toEqual(new ServiceResponse(200,
            {'Content-Type': mime.contentType(type) || 'application/octet-stream'},
            fakeReadStream));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(1);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledWith({username, name});
        expect(fsMock.createReadStream).toBeCalledTimes(1);
        expect(fsMock.createReadStream).toBeCalledWith(fakeAbsoluteFilePath);
    });

    it('should handle nonexistent repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        const {username, name} = fakeRepository;
        const {file} = await import('../Git');
        expect(
            await file({username, name}, fakeFilePath, fakeHeaders),
        ).toEqual(new ServiceResponse<string>(404, {}, '仓库不存在'));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(0);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(0);
        expect(fsMock.createReadStream).toBeCalledTimes(0);
    });

    it('should handle unavailable repository request', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(false);
        const {username, name} = fakeRepository;
        const {file} = await import('../Git');
        expect(
            await file({username, name}, fakeFilePath, fakeHeaders),
        ).toEqual(new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'}));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(0);
        expect(fsMock.createReadStream).toBeCalledTimes(0);
    });

    it('should handle fs.createFileReadStream error', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(true);
        fsMock.createReadStream.mockImplementation(() =>
        {
            process.nextTick(() =>
            {
                fakeReadStream.emit('error', new Error());
            });
            return fakeReadStream;
        });
        const {username, name} = fakeRepository;
        const {file} = await import('../Git');
        expect(
            await file({username, name}, fakeFilePath, fakeHeaders),
        ).toEqual(new ServiceResponse<string>(404, {}, '请求的文件不存在'));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(1);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledWith({username, name});
        expect(fsMock.createReadStream).toBeCalledTimes(1);
        expect(fsMock.createReadStream).toBeCalledWith(fakeAbsoluteFilePath);
    });
});