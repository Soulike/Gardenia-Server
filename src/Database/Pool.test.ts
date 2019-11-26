import {mockProcessExit} from 'jest-mock-process';
import signale from 'signale';

describe('Pool', () =>
{
    const clientMock = {
        query: jest.fn(),
        release: jest.fn(),
    };

    const poolMock = {
        connect: jest.fn(),
    };

    const pgMock = {
        Pool: jest.fn(),
    };

    const configMock = {
        DATABASE: {aaa: 'bbb'},
        SERVER: {
            ERROR_LOGGER: jest.fn(),
            SUCCESS_LOGGER: jest.fn(),
        },
    };

    beforeAll(() =>
    {
        mockProcessExit();
    });

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('pg', () => pgMock);
        jest.mock('../CONFIG', () => configMock);
        pgMock.Pool.mockImplementation(function ()
        {
            return poolMock;
        });
        clientMock.release.mockReturnValue(undefined);
        configMock.SERVER.ERROR_LOGGER.mockImplementation(signale.error);
        configMock.SERVER.SUCCESS_LOGGER.mockImplementation(signale.success);
    });

    it('should connect database', async function ()
    {
        clientMock.query.mockImplementation((_query: string, callback: (e: Error | null) => void) =>
        {
            callback(null);
        });
        poolMock.connect.mockResolvedValue(clientMock);
        await import('./Pool');
        expect(pgMock.Pool).toBeCalledWith(configMock.DATABASE);
        expect(poolMock.connect).toBeCalledTimes(1);
        expect(clientMock.query).toBeCalledTimes(1);
        expect(clientMock.release).toBeCalledTimes(1);
    });

    it('should handle connection failure', async function ()
    {
        poolMock.connect.mockRejectedValue(new Error());
        await import('./Pool');
        expect(pgMock.Pool).toBeCalledWith(configMock.DATABASE);
        expect(poolMock.connect).toBeCalledTimes(1);
        expect(clientMock.query).not.toBeCalled();
        expect(clientMock.release).not.toBeCalled();
    });

    it('should handle query test failure', async function ()
    {
        clientMock.query.mockImplementation((_query: string, callback: (e: Error | null) => void) =>
        {
            callback(new Error());
        });
        poolMock.connect.mockResolvedValue(clientMock);
        await import('./Pool');
        expect(pgMock.Pool).toBeCalledWith(configMock.DATABASE);
        expect(poolMock.connect).toBeCalledTimes(1);
        expect(clientMock.query).toBeCalledTimes(1);
        expect(clientMock.release).toBeCalledTimes(1);
    });
});