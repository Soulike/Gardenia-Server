import {Session as SessionFunction} from '../../../../Function';
import * as ParameterValidator from '../ParameterValidator';
import {RepositoryInfo as RepositoryInfoService} from '../../../../Service';
import {ParameterizedContext} from 'koa';
import {IContext, IState} from '../../../Interface';
import {RouterContext} from '@koa/router';
import {WrongParameterError} from '../../../Class';
import {Account, Commit, Repository, ResponseBody, ServiceResponse} from '../../../../Class';
import {ObjectType} from '../../../../CONSTANT';
import {Readable} from 'stream';

const functionMock = {
    Session: {
        isSessionValid: jest.fn<ReturnType<typeof SessionFunction.isSessionValid>,
            Parameters<typeof SessionFunction.isSessionValid>>(),
    },
};

const parameterValidatorMock = {
    repository: jest.fn<ReturnType<typeof ParameterValidator.repository>,
        Parameters<typeof ParameterValidator.repository>>(),
    branch: jest.fn<ReturnType<typeof ParameterValidator.branch>,
        Parameters<typeof ParameterValidator.branch>>(),
    lastCommit: jest.fn<ReturnType<typeof ParameterValidator.lastCommit>,
        Parameters<typeof ParameterValidator.lastCommit>>(),
    directory: jest.fn<ReturnType<typeof ParameterValidator.directory>,
        Parameters<typeof ParameterValidator.directory>>(),
    commitCount: jest.fn<ReturnType<typeof ParameterValidator.commitCount>,
        Parameters<typeof ParameterValidator.commitCount>>(),
    fileInfo: jest.fn<ReturnType<typeof ParameterValidator.fileInfo>,
        Parameters<typeof ParameterValidator.fileInfo>>(),
    rawFile: jest.fn<ReturnType<typeof ParameterValidator.rawFile>,
        Parameters<typeof ParameterValidator.rawFile>>(),
    setName: jest.fn<ReturnType<typeof ParameterValidator.setName>,
        Parameters<typeof ParameterValidator.setName>>(),
    setDescription: jest.fn<ReturnType<typeof ParameterValidator.setDescription>,
        Parameters<typeof ParameterValidator.setDescription>>(),
    setIsPublic: jest.fn<ReturnType<typeof ParameterValidator.setIsPublic>,
        Parameters<typeof ParameterValidator.setIsPublic>>(),
    groups: jest.fn<ReturnType<typeof ParameterValidator.groups>,
        Parameters<typeof ParameterValidator.groups>>(),
    addToGroup: jest.fn<ReturnType<typeof ParameterValidator.addToGroup>,
        Parameters<typeof ParameterValidator.addToGroup>>(),
};

const serviceMock = {
    RepositoryInfo: {
        repository: jest.fn<ReturnType<typeof RepositoryInfoService.repository>,
            Parameters<typeof RepositoryInfoService.repository>>(),
        branch: jest.fn<ReturnType<typeof RepositoryInfoService.branch>,
            Parameters<typeof RepositoryInfoService.branch>>(),
        lastCommit: jest.fn<ReturnType<typeof RepositoryInfoService.lastCommit>,
            Parameters<typeof RepositoryInfoService.lastCommit>>(),
        directory: jest.fn<ReturnType<typeof RepositoryInfoService.directory>,
            Parameters<typeof RepositoryInfoService.directory>>(),
        commitCount: jest.fn<ReturnType<typeof RepositoryInfoService.commitCount>,
            Parameters<typeof RepositoryInfoService.commitCount>>(),
        fileInfo: jest.fn<ReturnType<typeof RepositoryInfoService.fileInfo>,
            Parameters<typeof RepositoryInfoService.fileInfo>>(),
        rawFile: jest.fn<ReturnType<typeof RepositoryInfoService.rawFile>,
            Parameters<typeof RepositoryInfoService.rawFile>>(),
        setName: jest.fn<ReturnType<typeof RepositoryInfoService.setName>,
            Parameters<typeof RepositoryInfoService.setName>>(),
        setDescription: jest.fn<ReturnType<typeof RepositoryInfoService.setDescription>,
            Parameters<typeof RepositoryInfoService.setDescription>>(),
        setIsPublic: jest.fn<ReturnType<typeof RepositoryInfoService.setIsPublic>,
            Parameters<typeof RepositoryInfoService.setIsPublic>>(),
        groups: jest.fn<ReturnType<typeof RepositoryInfoService.groups>,
            Parameters<typeof RepositoryInfoService.groups>>(),
        addToGroup: jest.fn<ReturnType<typeof RepositoryInfoService.addToGroup>,
            Parameters<typeof RepositoryInfoService.addToGroup>>(),
    },
};

const nextMock = jest.fn();

describe('repository', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks()
            .resetModules()
            .mock('../../../../Function', () => functionMock)
            .mock('../../../../Service', () => serviceMock)
            .mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate body', async function ()
    {
        parameterValidatorMock.repository.mockReturnValue(false);
        const fakeBody = {a: 1};
        const fakeContext = {
            request: {body: fakeBody},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const {repository} = await import('../Middleware');
        await expect(repository()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.repository).toBeCalledTimes(1);
        expect(parameterValidatorMock.repository).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.repository).not.toBeCalled();
    });

    it('should call service', async function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
        } = {
            account: {username: 'ffaef'},
            repository: {name: 'faefeaf'},
        };
        const fakeSession = {b: 2};
        const fakeContext = {
            request: {body: fakeBody},
            session: fakeSession,
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse(200, {},
            new ResponseBody(true, '',
                new Repository('fa', 'faef', 'fea', true)));
        parameterValidatorMock.repository.mockReturnValue(true);
        serviceMock.RepositoryInfo.repository.mockResolvedValue(fakeServiceResponse);
        const {repository} = await import('../Middleware');
        await repository()(fakeContext, nextMock);
        expect(parameterValidatorMock.repository).toBeCalledTimes(1);
        expect(parameterValidatorMock.repository).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.repository).toBeCalledTimes(1);
        expect(serviceMock.RepositoryInfo.repository)
            .toBeCalledWith(fakeBody.account, fakeBody.repository, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('branch', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks()
            .resetModules()
            .mock('../../../../Function', () => functionMock)
            .mock('../../../../Service', () => serviceMock)
            .mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate body', async function ()
    {
        parameterValidatorMock.branch.mockReturnValue(false);
        const fakeBody = {a: 1};
        const fakeContext = {
            request: {body: fakeBody},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const {branch} = await import('../Middleware');
        await expect(branch()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.branch).toBeCalledTimes(1);
        expect(parameterValidatorMock.branch).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.branch).not.toBeCalled();
    });

    it('should call service', async function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
        } = {
            account: {username: 'ffaef'},
            repository: {name: 'faefeaf'},
        };
        const fakeSession = {b: 2};
        const fakeContext = {
            request: {body: fakeBody},
            session: fakeSession,
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse<Array<string>>(200, {},
            new ResponseBody(true, '',
                ['a', 'b']));
        parameterValidatorMock.branch.mockReturnValue(true);
        serviceMock.RepositoryInfo.branch.mockResolvedValue(fakeServiceResponse);
        const {branch} = await import('../Middleware');
        await branch()(fakeContext, nextMock);
        expect(parameterValidatorMock.branch).toBeCalledTimes(1);
        expect(parameterValidatorMock.branch).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.branch).toBeCalledTimes(1);
        expect(serviceMock.RepositoryInfo.branch)
            .toBeCalledWith(fakeBody.account, fakeBody.repository, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('lastCommit', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks()
            .resetModules()
            .mock('../../../../Function', () => functionMock)
            .mock('../../../../Service', () => serviceMock)
            .mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate body', async function ()
    {
        parameterValidatorMock.lastCommit.mockReturnValue(false);
        const fakeBody = {a: 1};
        const fakeContext = {
            request: {body: fakeBody},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const {lastCommit} = await import('../Middleware');
        await expect(lastCommit()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.lastCommit).toBeCalledTimes(1);
        expect(parameterValidatorMock.lastCommit).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.lastCommit).not.toBeCalled();
    });

    it('should call service', async function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath?: string,      // 文件，相对路径
        } = {
            account: {username: 'ffaef'},
            repository: {name: 'faefeaf'},
            commitHash: 'faefae',
            filePath: 'fafgaegae',
        };
        const fakeSession = {b: 2};
        const fakeContext = {
            request: {body: fakeBody},
            session: fakeSession,
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse(200, {},
            new ResponseBody(true, '',
                new Commit('faef', 'feaf', 'a@n.com', 'faef', 'faef')));
        parameterValidatorMock.lastCommit.mockReturnValue(true);
        serviceMock.RepositoryInfo.lastCommit.mockResolvedValue(fakeServiceResponse);
        const {lastCommit} = await import('../Middleware');
        await lastCommit()(fakeContext, nextMock);
        expect(parameterValidatorMock.lastCommit).toBeCalledTimes(1);
        expect(parameterValidatorMock.lastCommit).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.lastCommit).toBeCalledTimes(1);
        expect(serviceMock.RepositoryInfo.lastCommit)
            .toBeCalledWith(fakeBody.account, fakeBody.repository, fakeBody.commitHash, fakeSession, fakeBody.filePath);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('directory', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks()
            .resetModules()
            .mock('../../../../Function', () => functionMock)
            .mock('../../../../Service', () => serviceMock)
            .mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate body', async function ()
    {
        parameterValidatorMock.directory.mockReturnValue(false);
        const fakeBody = {a: 1};
        const fakeContext = {
            request: {body: fakeBody},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const {directory} = await import('../Middleware');
        await expect(directory()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.directory).toBeCalledTimes(1);
        expect(parameterValidatorMock.directory).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.directory).not.toBeCalled();
    });

    it('should call service', async function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            directoryPath: string,      // 文件，相对路径
        } = {
            account: {username: 'ffaef'},
            repository: {name: 'faefeaf'},
            commitHash: 'faefae',
            directoryPath: 'fafgaegae',
        };
        const fakeSession = {b: 2};
        const fakeContext = {
            request: {body: fakeBody},
            session: fakeSession,
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse<Array<{ type: ObjectType, path: string, commit: Commit }>>(
            200, {},
            new ResponseBody(true, '',
                [{
                    type: ObjectType.BLOB, path: 'string', commit:
                        new Commit('waf', 'fw', 'a@b.com', 'aef', 'fea'),
                }]));
        parameterValidatorMock.directory.mockReturnValue(true);
        serviceMock.RepositoryInfo.directory.mockResolvedValue(fakeServiceResponse);
        const {directory} = await import('../Middleware');
        await directory()(fakeContext, nextMock);
        expect(parameterValidatorMock.directory).toBeCalledTimes(1);
        expect(parameterValidatorMock.directory).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.directory).toBeCalledTimes(1);
        expect(serviceMock.RepositoryInfo.directory)
            .toBeCalledWith(fakeBody.account, fakeBody.repository, fakeBody.commitHash, fakeBody.directoryPath, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('commitCount', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks()
            .resetModules()
            .mock('../../../../Function', () => functionMock)
            .mock('../../../../Service', () => serviceMock)
            .mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate body', async function ()
    {
        parameterValidatorMock.commitCount.mockReturnValue(false);
        const fakeBody = {a: 1};
        const fakeContext = {
            request: {body: fakeBody},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const {commitCount} = await import('../Middleware');
        await expect(commitCount()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.commitCount).toBeCalledTimes(1);
        expect(parameterValidatorMock.commitCount).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.commitCount).not.toBeCalled();
    });

    it('should call service', async function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
        } = {
            account: {username: 'ffaef'},
            repository: {name: 'faefeaf'},
            commitHash: 'faefae',
        };
        const fakeSession = {b: 2};
        const fakeContext = {
            request: {body: fakeBody},
            session: fakeSession,
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse(
            200, {},
            new ResponseBody(true, '',
                {commitCount: 1}));
        parameterValidatorMock.commitCount.mockReturnValue(true);
        serviceMock.RepositoryInfo.commitCount.mockResolvedValue(fakeServiceResponse);
        const {commitCount} = await import('../Middleware');
        await commitCount()(fakeContext, nextMock);
        expect(parameterValidatorMock.commitCount).toBeCalledTimes(1);
        expect(parameterValidatorMock.commitCount).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.commitCount).toBeCalledTimes(1);
        expect(serviceMock.RepositoryInfo.commitCount)
            .toBeCalledWith(fakeBody.account, fakeBody.repository, fakeBody.commitHash, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('fileInfo', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks()
            .resetModules()
            .mock('../../../../Function', () => functionMock)
            .mock('../../../../Service', () => serviceMock)
            .mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate body', async function ()
    {
        parameterValidatorMock.fileInfo.mockReturnValue(false);
        const fakeBody = {a: 1};
        const fakeContext = {
            request: {body: fakeBody},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const {fileInfo} = await import('../Middleware');
        await expect(fileInfo()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.fileInfo).toBeCalledTimes(1);
        expect(parameterValidatorMock.fileInfo).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.fileInfo).not.toBeCalled();
    });

    it('should call service', async function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            filePath: string,
            commitHash: string,
        } = {
            account: {username: 'ffaef'},
            repository: {name: 'faefeaf'},
            filePath: 'string',
            commitHash: 'faefae',
        };
        const fakeSession = {b: 2};
        const fakeContext = {
            request: {body: fakeBody},
            session: fakeSession,
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse(
            200, {},
            new ResponseBody(true, '',
                {exists: false}));
        parameterValidatorMock.fileInfo.mockReturnValue(true);
        serviceMock.RepositoryInfo.fileInfo.mockResolvedValue(fakeServiceResponse);
        const {fileInfo} = await import('../Middleware');
        await fileInfo()(fakeContext, nextMock);
        expect(parameterValidatorMock.fileInfo).toBeCalledTimes(1);
        expect(parameterValidatorMock.fileInfo).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.fileInfo).toBeCalledTimes(1);
        expect(serviceMock.RepositoryInfo.fileInfo)
            .toBeCalledWith(fakeBody.account, fakeBody.repository, fakeBody.filePath, fakeBody.commitHash, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});

describe('rawFile', () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks()
            .resetModules()
            .mock('../../../../Function', () => functionMock)
            .mock('../../../../Service', () => serviceMock)
            .mock('../ParameterValidator', () => parameterValidatorMock);
    });

    it('should validate body', async function ()
    {
        parameterValidatorMock.rawFile.mockReturnValue(false);
        const fakeBody = {a: 1};
        const fakeContext = {
            request: {body: fakeBody},
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const {rawFile} = await import('../Middleware');
        await expect(rawFile()(fakeContext, nextMock)).rejects.toEqual(new WrongParameterError());
        expect(parameterValidatorMock.rawFile).toBeCalledTimes(1);
        expect(parameterValidatorMock.rawFile).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.rawFile).not.toBeCalled();
    });

    it('should call service', async function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            filePath: string,
            commitHash: string,
        } = {
            account: {username: 'ffaef'},
            repository: {name: 'faefeaf'},
            filePath: 'string',
            commitHash: 'faefae',
        };
        const fakeSession = {b: 2};
        const fakeContext = {
            request: {body: fakeBody},
            session: fakeSession,
            state: <IState>{
                serviceResponse: {},
            },
        } as unknown as ParameterizedContext<IState, IContext & RouterContext<IState, IContext>>;
        const fakeServiceResponse = new ServiceResponse(
            200, {},
            new ResponseBody(true, '',
                new Readable()));
        parameterValidatorMock.rawFile.mockReturnValue(true);
        serviceMock.RepositoryInfo.rawFile.mockResolvedValue(fakeServiceResponse);
        const {rawFile} = await import('../Middleware');
        await rawFile()(fakeContext, nextMock);
        expect(parameterValidatorMock.rawFile).toBeCalledTimes(1);
        expect(parameterValidatorMock.rawFile).toBeCalledWith(fakeBody);
        expect(serviceMock.RepositoryInfo.rawFile).toBeCalledTimes(1);
        expect(serviceMock.RepositoryInfo.rawFile)
            .toBeCalledWith(fakeBody.account, fakeBody.repository, fakeBody.filePath, fakeBody.commitHash, fakeSession);
        expect(fakeContext.state.serviceResponse).toEqual(fakeServiceResponse);
    });
});