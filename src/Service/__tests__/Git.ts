import {Repository as RepositoryTable} from '../../Database';
import {Git, Promisify, Repository} from '../../Function';
import {Repository as RepositoryClass, ServiceResponse} from '../../Class';
import path from 'path';
import {EventEmitter} from 'events';
import mime from 'mime-types';
import {advertise, file, rpc} from '../Git';
import {Readable} from 'stream';

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
        repositoryIsModifiableToTheRequest: jest.fn<ReturnType<typeof Repository.repositoryIsModifiableToTheRequest>,
            Parameters<typeof Repository.repositoryIsModifiableToTheRequest>>(),
        generateRefsServiceResponse: jest.fn<ReturnType<typeof Repository.generateRefsServiceResponse>,
            Parameters<typeof Repository.generateRefsServiceResponse>>(),
    },
    Git: {
        generateRepositoryPath: jest.fn<ReturnType<typeof Git.generateRepositoryPath>,
            Parameters<typeof Git.generateRepositoryPath>>(),
        doAdvertiseRPCCall: jest.fn<ReturnType<typeof Git.doAdvertiseRPCCall>,
            Parameters<typeof Git.doAdvertiseRPCCall>>(),
        doRPCCall: jest.fn<ReturnType<typeof Git.doRPCCall>,
            Parameters<typeof Git.doRPCCall>>(),
        doUpdateServerInfo: jest.fn<ReturnType<typeof Git.doUpdateServerInfo>,
            Parameters<typeof Git.doUpdateServerInfo>>(),
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

describe(`${advertise.name}`, () =>
{
    const fakeRepository = new RepositoryClass('feaqfgaefg', 'faegaeg', 'gfagaeg', true);
    const fakeRepositoryPath = path.join('aegaegaeg', 'hbwhwr');
    const fakeHeaders = {afgaeg: 'gaghaeshgaes'};
    const fakeRefsServiceResponse = 'bougboqegoaqeughoqeag98';
    const fakeRPCCallOutput = 'fgoag983gh9w398wy';

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
        functionMock.Git.doAdvertiseRPCCall.mockResolvedValue(fakeRPCCallOutput);
        functionMock.Repository.generateRefsServiceResponse.mockReturnValue(fakeRefsServiceResponse);
    });

    it('should handle nonexistent repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        const {username, name} = fakeRepository;
        const {advertise} = await import('../Git');
        expect(await advertise({username, name}, 'faefae', fakeHeaders))
            .toEqual(new ServiceResponse(404, {}, '仓库不存在'));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(0);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledTimes(0);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(0);
        expect(functionMock.Git.doAdvertiseRPCCall).toBeCalledTimes(0);
        expect(functionMock.Repository.generateRefsServiceResponse).toBeCalledTimes(0);
    });

    it('should handle unavailable repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(false);
        const {username, name} = fakeRepository;
        const {advertise} = await import('../Git');
        expect(await advertise({username, name}, 'faefae', fakeHeaders))
            .toEqual(new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'}));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledTimes(0);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(0);
        expect(functionMock.Git.doAdvertiseRPCCall).toBeCalledTimes(0);
        expect(functionMock.Repository.generateRefsServiceResponse).toBeCalledTimes(0);
    });

    it('should handle non-"git-receive-pack" request', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(true);
        functionMock.Git.doAdvertiseRPCCall.mockResolvedValue(fakeRPCCallOutput);
        const fakeService = 'gaegaeg';
        const {username, name} = fakeRepository;
        const {advertise} = await import('../Git');
        expect(await advertise({username, name}, fakeService, fakeHeaders))
            .toEqual(new ServiceResponse<string | void>(200, {
                'Content-Type': `application/x-${fakeService}-advertisement`,
            }, fakeRefsServiceResponse));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledTimes(0);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(1);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledWith({username, name});
        expect(functionMock.Git.doAdvertiseRPCCall).toBeCalledTimes(1);
        expect(functionMock.Git.doAdvertiseRPCCall).toBeCalledWith(fakeRepositoryPath, fakeService);
        expect(functionMock.Repository.generateRefsServiceResponse).toBeCalledTimes(1);
        expect(functionMock.Repository.generateRefsServiceResponse).toBeCalledWith(fakeService, fakeRPCCallOutput);
    });

    it('should handle unmodifiable "git-receive-pack" request', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(true);
        functionMock.Repository.repositoryIsModifiableToTheRequest.mockResolvedValue(false);
        const fakeService = 'git-receive-pack';
        const {username, name} = fakeRepository;
        const {advertise} = await import('../Git');
        expect(await advertise({username, name}, fakeService, fakeHeaders))
            .toEqual(new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'}));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(0);
        expect(functionMock.Git.doAdvertiseRPCCall).toBeCalledTimes(0);
        expect(functionMock.Repository.generateRefsServiceResponse).toBeCalledTimes(0);
    });

    it('should handle modifiable "git-receive-pack" request', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(true);
        functionMock.Repository.repositoryIsModifiableToTheRequest.mockResolvedValue(true);
        functionMock.Git.doAdvertiseRPCCall.mockResolvedValue(fakeRPCCallOutput);
        const fakeService = 'git-receive-pack';
        const {username, name} = fakeRepository;
        const {advertise} = await import('../Git');
        expect(await advertise({username, name}, fakeService, fakeHeaders))
            .toEqual(new ServiceResponse<string | void>(200, {
                'Content-Type': `application/x-${fakeService}-advertisement`,
            }, fakeRefsServiceResponse));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(1);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledWith({username, name});
        expect(functionMock.Git.doAdvertiseRPCCall).toBeCalledTimes(1);
        expect(functionMock.Git.doAdvertiseRPCCall).toBeCalledWith(fakeRepositoryPath, fakeService);
        expect(functionMock.Repository.generateRefsServiceResponse).toBeCalledTimes(1);
        expect(functionMock.Repository.generateRefsServiceResponse).toBeCalledWith(fakeService, fakeRPCCallOutput);
    });
});

describe(`${rpc.name}`, () =>
{
    const fakeRepository = new RepositoryClass('feaqfgaefg', 'faegaeg', 'gfagaeg', true);
    const fakeRepositoryPath = path.join('aegaegaeg', 'hbwhwr');
    const fakeHeaders = {afgaeg: 'gaghaeshgaes'};
    const fakeParameterStream = new Readable();

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../../Database', () => databaseMock);
        jest.mock('../../Function', () => functionMock);
        functionMock.Git.generateRepositoryPath.mockReturnValue(fakeRepositoryPath);
    });

    it('should handle nonexistent repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        const {username, name} = fakeRepository;
        const {rpc} = await import('../Git');
        expect(await rpc({username, name}, 'feafaef', fakeHeaders, fakeParameterStream))
            .toEqual(new ServiceResponse<string>(404, {}, '仓库不存在'));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(0);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledTimes(0);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(0);
        expect(functionMock.Git.doRPCCall).toBeCalledTimes(0);
        expect(functionMock.Git.doUpdateServerInfo).toBeCalledTimes(0);
    });

    it('should handle unavailable repository', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(false);
        const {username, name} = fakeRepository;
        const {rpc} = await import('../Git');
        expect(await rpc({username, name}, 'feafaef', fakeHeaders, fakeParameterStream))
            .toEqual(new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'}));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledTimes(0);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(0);
        expect(functionMock.Git.doRPCCall).toBeCalledTimes(0);
        expect(functionMock.Git.doUpdateServerInfo).toBeCalledTimes(0);
    });

    it('should handle non-"receive-pack" request', async function ()
    {
        const fakeRPCCallOutputStream = new Readable();
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(true);
        functionMock.Git.doRPCCall.mockImplementation(() =>
        {
            process.nextTick(() =>
            {
                fakeRPCCallOutputStream.emit('close');
            });
            return fakeRPCCallOutputStream;
        });
        const {username, name} = fakeRepository;
        const command = 'faqefgaeqgae';
        const {rpc} = await import('../Git');
        expect(await rpc({username, name}, command, fakeHeaders, fakeParameterStream))
            .toEqual(new ServiceResponse<Readable>(200, {
                'Content-Type': `application/x-git-${command}-result`,
            }, fakeRPCCallOutputStream));
        await Promisify.waitForEvent(fakeRPCCallOutputStream, 'close');
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledTimes(0);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(1);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledWith({username, name});
        expect(functionMock.Git.doRPCCall).toBeCalledTimes(1);
        expect(functionMock.Git.doRPCCall).toBeCalledWith(fakeRepositoryPath, command, fakeParameterStream);
        expect(functionMock.Git.doUpdateServerInfo).toBeCalledTimes(0);
    });

    it('should handle unmodifiable "receive-pack" request', async function ()
    {
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(true);
        functionMock.Repository.repositoryIsModifiableToTheRequest.mockResolvedValue(false);
        const {username, name} = fakeRepository;
        const command = 'receive-pack';
        const {rpc} = await import('../Git');
        expect(await rpc({username, name}, command, fakeHeaders, fakeParameterStream))
            .toEqual(new ServiceResponse(401, {'WWW-Authenticate': 'Basic realm=Gardenia'}));
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(0);
        expect(functionMock.Git.doRPCCall).toBeCalledTimes(0);
        expect(functionMock.Git.doUpdateServerInfo).toBeCalledTimes(0);
    });

    it('should handle modifiable "receive-pack" request', async function ()
    {
        const fakeRPCCallOutputStream = new Readable();
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheRequest.mockResolvedValue(true);
        functionMock.Repository.repositoryIsModifiableToTheRequest.mockResolvedValue(true);
        functionMock.Git.doRPCCall.mockImplementation(() =>
        {
            process.nextTick(() =>
            {
                fakeRPCCallOutputStream.emit('close');
            });
            return fakeRPCCallOutputStream;
        });
        const {username, name} = fakeRepository;
        const command = 'receive-pack';
        const {rpc} = await import('../Git');
        expect(await rpc({username, name}, command, fakeHeaders, fakeParameterStream))
            .toEqual(new ServiceResponse<Readable>(200, {
                'Content-Type': `application/x-git-${command}-result`,
            }, fakeRPCCallOutputStream));
        await Promisify.waitForEvent(fakeRPCCallOutputStream, 'close');
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName).toBeCalledWith({username, name});
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsModifiableToTheRequest).toBeCalledWith(fakeRepository, fakeHeaders);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledTimes(1);
        expect(functionMock.Git.generateRepositoryPath).toBeCalledWith({username, name});
        expect(functionMock.Git.doRPCCall).toBeCalledTimes(1);
        expect(functionMock.Git.doRPCCall).toBeCalledWith(fakeRepositoryPath, command, fakeParameterStream);
        expect(functionMock.Git.doUpdateServerInfo).toBeCalledTimes(1);
        expect(functionMock.Git.doUpdateServerInfo).toBeCalledWith(fakeRepositoryPath);
    });
});