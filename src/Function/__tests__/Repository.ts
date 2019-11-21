import {
    generateRefsServiceResponse,
    repositoryIsAvailableToTheRequest,
    repositoryIsAvailableToTheViewer,
    repositoryIsModifiableToTheRequest,
} from '../Repository';
import {Account, Repository} from '../../Class';
import faker from 'faker';
import {Account as AccountTable} from '../../Database';
import * as Authentication from '../Authentication';

const authenticationMock = {
    getAccountFromAuthenticationHeader: jest.fn<ReturnType<typeof Authentication.getAccountFromAuthenticationHeader>,
        Parameters<typeof Authentication.getAccountFromAuthenticationHeader>>(),
};
const databaseMock = {
    Account: {
        selectByUsername: jest.fn<ReturnType<typeof AccountTable.selectByUsername>,
            Parameters<typeof AccountTable.selectByUsername>>(),
    },
};

describe(repositoryIsAvailableToTheViewer, () =>
{
    const fakeAccount = new Account(faker.random.word(), faker.random.alphaNumeric(64));
    const fakeViewer = new Account(faker.random.word(), faker.random.alphaNumeric(64));

    it('public repository is available to any one', function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true,
        );
        expect(
            repositoryIsAvailableToTheViewer(fakeRepository, fakeViewer),
        ).toBe(true);
    });

    it('private repository is only available to owner', function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false,
        );
        expect(
            repositoryIsAvailableToTheViewer(fakeRepository, fakeViewer),
        ).toBe(false);
        expect(
            repositoryIsAvailableToTheViewer(fakeRepository, fakeAccount),
        ).toBe(true);
    });

    it('nonexistent repository is unavailable', function ()
    {
        expect(
            repositoryIsAvailableToTheViewer(null, fakeViewer),
        ).toBe(false);
        expect(
            repositoryIsAvailableToTheViewer(null, fakeAccount),
        ).toBe(false);
    });
});

describe(repositoryIsAvailableToTheRequest, () =>
{
    const fakeHeader = {
        authorization: faker.random.alphaNumeric(20),
    };
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeViewer = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../Authentication', () => authenticationMock);
        jest.mock('../../Database', () => databaseMock);
    });

    it('should return true when repository is public', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(fakeViewer);
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeViewer);
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true);
        const {repositoryIsAvailableToTheRequest} = await import('../Repository');
        expect(await repositoryIsAvailableToTheRequest(fakeRepository, fakeHeader)).toBe(true);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([
            [fakeViewer.username],
        ]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });

    it('should return true when repository is private and requested by owner', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(fakeAccount);
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeAccount);
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false);
        const {repositoryIsAvailableToTheRequest} = await import('../Repository');
        expect(await repositoryIsAvailableToTheRequest(fakeRepository, fakeHeader)).toBe(true);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([
            [fakeAccount.username],
        ]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });

    it('should return false when repository is private and not requested by owner', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(fakeViewer);
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeViewer);
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            false);
        const {repositoryIsAvailableToTheRequest} = await import('../Repository');
        expect(await repositoryIsAvailableToTheRequest(fakeRepository, fakeHeader)).toBe(false);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([
            [fakeViewer.username],
        ]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });

    it('should return false when no authentication info', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(null);
        const fakeRepository = new Repository(
            faker.name.firstName(),
            faker.random.word(),
            faker.lorem.sentence(),
            true);
        const {repositoryIsAvailableToTheRequest} = await import('../Repository');
        expect(await repositoryIsAvailableToTheRequest(fakeRepository, fakeHeader)).toBe(false);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });

    it('should return false when account does not exist', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(fakeViewer);
        databaseMock.Account.selectByUsername.mockResolvedValue(null);
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true);
        const {repositoryIsAvailableToTheRequest} = await import('../Repository');
        expect(await repositoryIsAvailableToTheRequest(fakeRepository, fakeHeader)).toBe(false);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([
            [fakeViewer.username],
        ]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });

    it('should return false when hash is wrong', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue({
            ...fakeViewer,
            hash: faker.random.alphaNumeric(64),
        });
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeViewer);
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true);
        const {repositoryIsAvailableToTheRequest} = await import('../Repository');
        expect(await repositoryIsAvailableToTheRequest(fakeRepository, fakeHeader)).toBe(false);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([
            [
                fakeViewer.username,
            ],
        ]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });
});

describe(repositoryIsModifiableToTheRequest, () =>
{
    const fakeHeader = {
        authorization: faker.random.alphaNumeric(20),
    };
    const fakeAccount = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));
    const fakeViewer = new Account(faker.name.firstName(), faker.random.alphaNumeric(64));

    beforeEach(() =>
    {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('../Authentication', () => authenticationMock);
        jest.mock('../../Database', () => databaseMock);
    });

    it('only owner can modify the repository', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(fakeAccount);
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeAccount);
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true);
        const {repositoryIsModifiableToTheRequest} = await import('../Repository');
        expect(await repositoryIsModifiableToTheRequest(fakeRepository, fakeHeader)).toBe(true);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([
            [fakeAccount.username],
        ]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });

    it('other can not modify the repository', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(fakeViewer);
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeViewer);
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true);
        const {repositoryIsModifiableToTheRequest} = await import('../Repository');
        expect(await repositoryIsModifiableToTheRequest(fakeRepository, fakeHeader)).toBe(false);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([
            [
                fakeViewer.username,
            ],
        ]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });

    it('should return false when no authentication info', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(null);
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeViewer);
        const fakeRepository = new Repository(
            faker.name.firstName(),
            faker.random.word(),
            faker.lorem.sentence(),
            true);
        const {repositoryIsModifiableToTheRequest} = await import('../Repository');
        expect(await repositoryIsModifiableToTheRequest(fakeRepository, fakeHeader)).toBe(false);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });

    it('should return false when account does not exist', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(fakeViewer);
        databaseMock.Account.selectByUsername.mockResolvedValue(null);
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true);
        const {repositoryIsModifiableToTheRequest} = await import('../Repository');
        expect(await repositoryIsModifiableToTheRequest(fakeRepository, fakeHeader)).toBe(false);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([
            [fakeViewer.username],
        ]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });

    it('should return false when hash is wrong', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue({
            ...fakeViewer,
            hash: faker.random.alphaNumeric(64),
        });
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeViewer);
        const fakeRepository = new Repository(
            fakeAccount.username,
            faker.random.word(),
            faker.lorem.sentence(),
            true);
        const {repositoryIsModifiableToTheRequest} = await import('../Repository');
        expect(await repositoryIsModifiableToTheRequest(fakeRepository, fakeHeader)).toBe(false);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([
            [
                fakeViewer.username,
            ],
        ]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });
});

describe(generateRefsServiceResponse, () =>
{
    it('should generate refs service response', function ()
    {
        const fakeService = faker.random.alphaNumeric(10);
        const fakeRPCOutput = faker.lorem.sentence();
        const serverAdvert = `# service=${fakeService}`;
        const length = serverAdvert.length + 4;
        expect(generateRefsServiceResponse(fakeService, fakeRPCOutput)).toBe(
            `${length.toString(16).padStart(4, '0')}${serverAdvert}0000${fakeRPCOutput}`,
        );
    });
});