import {Profile as ProfileTable, Repository as RepositoryTable, Star as StarTable} from '../../Database';
import {Repository as RepositoryFunction} from '../../Function';
import {AccountRepository, Repository, ResponseBody, ServiceResponse} from '../../Class';
import {add, remove} from '../Star';

const databaseMock = {
    Profile: {
        selectByUsername: jest.fn<ReturnType<typeof ProfileTable.selectByUsername>,
            Parameters<typeof ProfileTable.selectByUsername>>(),
    },
    Repository: {
        selectByUsernameAndName: jest.fn<ReturnType<typeof RepositoryTable.selectByUsernameAndName>,
            Parameters<typeof RepositoryTable.selectByUsernameAndName>>(),
    },
    Star: {
        select: jest.fn<ReturnType<typeof StarTable.select>,
            Parameters<typeof StarTable.select>>(),
        insert: jest.fn<ReturnType<typeof StarTable.insert>,
            Parameters<typeof StarTable.insert>>(),
        del: jest.fn<ReturnType<typeof StarTable.del>,
            Parameters<typeof StarTable.del>>(),
        count: jest.fn<ReturnType<typeof StarTable.count>,
            Parameters<typeof StarTable.count>>(),
    },
};

const functionMock = {
    Repository: {
        repositoryIsAvailableToTheViewer: jest.fn<ReturnType<typeof RepositoryFunction.repositoryIsAvailableToTheViewer>,
            Parameters<typeof RepositoryFunction.repositoryIsAvailableToTheViewer>>(),
    },
};

describe(`${add.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks()
            .resetModules()
            .mock('../../Database', () => databaseMock)
            .mock('../../Function', () => functionMock);
    });

    it('should handle nonexistent repository', async function ()
    {
        const fakeRepository = {username: 'fa', name: 'faef'};
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        const {add} = await import('../Star');
        expect(await add(fakeRepository, 'awfae'))
            .toEqual(new ServiceResponse<void>(404, {},
                new ResponseBody(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledWith(fakeRepository);
        expect(databaseMock.Star.insert).not.toBeCalled();
    });

    it('should handle private repository', async function ()
    {
        const fakeRepository = new Repository('afe', 'fae', '', false);
        const fakeUsername = 'faegaeg';
        databaseMock.Repository.selectByUsernameAndName
            .mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer
            .mockResolvedValue(false);
        const {add} = await import('../Star');
        expect(await add(
            {name: fakeRepository.name, username: fakeRepository.username},
            fakeUsername))
            .toEqual(new ServiceResponse<void>(404, {},
                new ResponseBody(false, '仓库不存在')));
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledTimes(1);
        expect(functionMock.Repository.repositoryIsAvailableToTheViewer)
            .toBeCalledWith(fakeRepository, {username: fakeUsername});
        expect(databaseMock.Star.insert).not.toBeCalled();
    });

    it('should handle stared repository', async function ()
    {
        const fakeRepository = new Repository('afe', 'fae', '', false);
        const fakeUsername = 'faegaeg';
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockResolvedValue(true);
        databaseMock.Star.count.mockResolvedValue(1);
        const {add} = await import('../Star');
        expect(await add({username: fakeRepository.username, name: fakeRepository.name},
            fakeUsername))
            .toEqual(new ServiceResponse<void>(200, {},
                new ResponseBody(true)));
        expect(databaseMock.Star.count).toBeCalledTimes(1);
        expect(databaseMock.Star.count)
            .toBeCalledWith(new AccountRepository(fakeUsername, fakeRepository.username, fakeRepository.name));
        expect(databaseMock.Star.insert).not.toBeCalled();
    });

    it('should add star to repository', async function ()
    {
        const fakeRepository = new Repository('afe', 'fae', '', false);
        const fakeUsername = 'faegaeg';
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        functionMock.Repository.repositoryIsAvailableToTheViewer.mockResolvedValue(true);
        databaseMock.Star.count.mockResolvedValue(0);
        databaseMock.Star.insert.mockResolvedValue();
        const {add} = await import('../Star');
        expect(await add({username: fakeRepository.username, name: fakeRepository.name},
            fakeUsername))
            .toEqual(new ServiceResponse<void>(200, {},
                new ResponseBody(true)));
        expect(databaseMock.Star.insert).toBeCalledTimes(1);
        expect(databaseMock.Star.insert)
            .toBeCalledWith(new AccountRepository(fakeUsername, fakeRepository.username, fakeRepository.name));
    });
});

describe(`${remove.name}`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks()
            .resetModules()
            .mock('../../Database', () => databaseMock)
            .mock('../../Function', () => functionMock);
    });

    it('should handle nonexistent repository', async function ()
    {
        const fakeRepository = {username: 'fa', name: 'faef'};
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(null);
        const {remove} = await import('../Star');
        expect(await remove(fakeRepository, 'awfae'))
            .toEqual(new ServiceResponse<void>(404, {},
                new ResponseBody(false, '仓库不存在')));
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledTimes(1);
        expect(databaseMock.Repository.selectByUsernameAndName)
            .toBeCalledWith(fakeRepository);
        expect(databaseMock.Star.del).not.toBeCalled();
    });

    it('should handle non-stared repository', async function ()
    {
        const fakeRepository = new Repository('afe', 'fae', '', false);
        const fakeUsername = 'faegaeg';
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        databaseMock.Star.count.mockResolvedValue(0);
        const {remove} = await import('../Star');
        expect(await remove({username: fakeRepository.username, name: fakeRepository.name},
            fakeUsername))
            .toEqual(new ServiceResponse<void>(200, {},
                new ResponseBody(true)));
        expect(databaseMock.Star.count).toBeCalledTimes(1);
        expect(databaseMock.Star.count)
            .toBeCalledWith(new AccountRepository(fakeUsername, fakeRepository.username, fakeRepository.name));
        expect(databaseMock.Star.del).not.toBeCalled();
    });

    it('should remove star to repository', async function ()
    {
        const fakeRepository = new Repository('afe', 'fae', '', false);
        const fakeUsername = 'faegaeg';
        databaseMock.Repository.selectByUsernameAndName.mockResolvedValue(fakeRepository);
        databaseMock.Star.count.mockResolvedValue(1);
        databaseMock.Star.del.mockResolvedValue();
        const {remove} = await import('../Star');
        expect(await remove({username: fakeRepository.username, name: fakeRepository.name},
            fakeUsername))
            .toEqual(new ServiceResponse<void>(200, {},
                new ResponseBody(true)));
        expect(databaseMock.Star.del).toBeCalledTimes(1);
        expect(databaseMock.Star.del)
            .toBeCalledWith(new AccountRepository(fakeUsername, fakeRepository.username, fakeRepository.name));
    });
});
