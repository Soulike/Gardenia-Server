import {
    generateRefsServiceResponse,
    repositoryIsAvailableToTheRequest,
    repositoryIsAvailableToTheViewer,
    repositoryIsModifiableToTheRequest,
} from '../Repository';
import {Account, Repository} from '../../Class';
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

describe(`${repositoryIsAvailableToTheViewer.name}`, () =>
{
    const fakeAccount = new Account('fafgaefg', 'i'.repeat(64));
    const fakeViewer = new Account('faafawfaefgaefg', 'i'.repeat(64));

    it('public repository is available to any one', function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            'faibjfbaei',
            'fbiuagqfi',
            true,
        );
        expect(
            repositoryIsAvailableToTheViewer(fakeRepository, fakeViewer),
        ).toBe(true);
        expect(
            repositoryIsAvailableToTheViewer(fakeRepository, {username: undefined}),
        ).toBe(true);
    });

    it('private repository is only available to owner', function ()
    {
        const fakeRepository = new Repository(
            fakeAccount.username,
            'faibjfafawfbaei',
            'fbifafuagqfi',
            false,
        );
        expect(
            repositoryIsAvailableToTheViewer(fakeRepository, fakeViewer),
        ).toBe(false);
        expect(
            repositoryIsAvailableToTheViewer(fakeRepository, {username: undefined}),
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

describe(`${repositoryIsAvailableToTheRequest.name}`, () =>
{
    const fakeHeader = {
        authorization: 'bviaegbiueagiaebuaeugb',
    };
    const fakeAccount = new Account('fawfaefaef', 'r'.repeat(64));
    const fakeViewer = new Account('fawfuyvuaefaef', 'r'.repeat(64));

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
            'vaegaegaegf',
            'fiahybbegiaegbia',
            true);
        const {repositoryIsAvailableToTheRequest} = await import('../Repository');
        expect(await repositoryIsAvailableToTheRequest(fakeRepository, fakeHeader)).toBe(true);
        expect(await repositoryIsAvailableToTheRequest(fakeRepository, {})).toBe(true);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([]);
    });

    it('should return true when repository is private and requested by owner', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(fakeAccount);
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeAccount);
        const fakeRepository = new Repository(
            fakeAccount.username,
            'fgiabuebgiaeugb',
            'fiabubgiaugbi7qag98aiua',
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
            'fgiabuebgiaeugb',
            'fiabubgiaugbi7qag98aiua',
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

    it('should return false when no authentication info and repository is private', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(null);
        const fakeRepository = new Repository(
            'fibuaubfiaufgbiuagviuae',
            'fgiabuebgiaeugb',
            'fiabubgiaugbi7qag98aiua',
            false);
        const {repositoryIsAvailableToTheRequest} = await import('../Repository');
        expect(await repositoryIsAvailableToTheRequest(fakeRepository, fakeHeader)).toBe(false);
        expect(databaseMock.Account.selectByUsername.mock.calls).toEqual([]);
        expect(authenticationMock.getAccountFromAuthenticationHeader.mock.calls)
            .toEqual([
                [fakeHeader],
            ]);
    });

    it('should return false when account does not exist and repository is private', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue(fakeViewer);
        databaseMock.Account.selectByUsername.mockResolvedValue(null);
        const fakeRepository = new Repository(
            fakeAccount.username,
            'fgiabuebgiaeugb',
            'fiabubgiaugbi7qag98aiua',
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

    it('should return false when hash is wrong and repository is private', async function ()
    {
        authenticationMock.getAccountFromAuthenticationHeader.mockReturnValue({
            ...fakeViewer,
            hash: 'e'.repeat(64),
        });
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeViewer);
        const fakeRepository = new Repository(
            fakeAccount.username,
            'fgiabuebgiaeugb',
            'fiabubgiaugbi7qag98aiua',
            false);
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

describe(`${repositoryIsModifiableToTheRequest.name}`, () =>
{
    const fakeHeader = {
        authorization: 'fbigauygfiaugf',
    };
    const fakeAccount = new Account('fawfaefaef', 'r'.repeat(64));
    const fakeViewer = new Account('fawfuyvuaefaef', 'r'.repeat(64));

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
            'fgiabuebgiaeugb',
            'fiabubgiaugbi7qag98aiua',
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
            'fgiabuebgiaeugb',
            'fiabubgiaugbi7qag98aiua',
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
            'fgonangoauebgouae',
            'fgiabuebgiaeugb',
            'fiabubgiaugbi7qag98aiua',
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
            'fgiabuebgiaeugb',
            'fiabubgiaugbi7qag98aiua',
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
            hash: 't'.repeat(64),
        });
        databaseMock.Account.selectByUsername.mockResolvedValue(fakeViewer);
        const fakeRepository = new Repository(
            fakeAccount.username,
            'fgiabuebgiaeugb',
            'fiabubgiaugbi7qag98aiua',
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

describe(`${generateRefsServiceResponse.name}`, () =>
{
    it('should generate refs service response', function ()
    {
        const fakeService = 'fn8q73gh89q73ghioqu7g';
        const fakeRPCOutput = 'nfvi8q3ahgoiqygthaoi38gy';
        const serverAdvert = `# service=${fakeService}`;
        const length = serverAdvert.length + 4;
        expect(generateRefsServiceResponse(fakeService, fakeRPCOutput)).toBe(
            `${length.toString(16).padStart(4, '0')}${serverAdvert}0000${fakeRPCOutput}`,
        );
    });
});