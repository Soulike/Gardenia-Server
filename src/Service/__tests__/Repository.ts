import {getRepositories} from '../Repository';
import {Account, Repository as RepositoryClass, Repository, ResponseBody, ServiceResponse} from '../../Class';
import faker from 'faker';
import {Session} from 'koa-session';

const fakeAccount = new Account(faker.random.word(), faker.random.alphaNumeric(64));
const fakeOthersSession: Session = {username: faker.random.word()} as unknown as Session;
const fakeOwnSession: Session = {username: fakeAccount.username} as unknown as Session;
const fakeRepositories = [
    new Repository(faker.name.firstName(), faker.random.word(), faker.lorem.sentence(), true),
    new Repository(faker.name.firstName(), faker.random.word(), faker.lorem.sentence(), false),
    new Repository(faker.name.firstName(), faker.random.word(), faker.lorem.sentence(), true),
];

describe(getRepositories, () =>
{
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