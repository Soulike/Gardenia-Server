import {Account, Profile} from '../../../../Class';
import 'jest-extended';

const ClassMock = {
    Account: {
        validate: jest.fn<ReturnType<typeof Account.validate>,
            Parameters<typeof Account.validate>>(),
    },
    Profile: {
        validate: jest.fn<ReturnType<typeof Profile.validate>,
            Parameters<typeof Profile.validate>>(),
    },
};

describe(`login`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Class', () => ClassMock);
    });

    it('should call Account.validate()', async function ()
    {
        ClassMock.Account.validate.mockReturnValueOnce(true);
        ClassMock.Account.validate.mockReturnValueOnce(false);
        const fakeBody = new Account('dafae', 'a'.repeat(64));
        const {login} = await import('../ParameterValidator');
        expect(login(fakeBody)).toBeTrue();
        expect(login(fakeBody)).toBeFalse();
        expect(ClassMock.Account.validate).toBeCalledTimes(2);
        expect(ClassMock.Account.validate).toHaveBeenNthCalledWith(1, fakeBody);
        expect(ClassMock.Account.validate).toHaveBeenNthCalledWith(2, fakeBody);
    });
});

describe(`register`, () =>
{
    const fakeAccount = new Account('fafae', 'a'.repeat(64));
    const fakeProfile: Omit<Profile, 'username'> = {
        nickname: 'fafaewf',
        email: 'a@b.com',
        avatar: '',
    };

    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Class', () => ClassMock);
    });

    it('should call Account.validate and Profile.validate', async function ()
    {
        ClassMock.Account.validate.mockReturnValue(true);
        ClassMock.Profile.validate.mockReturnValue(false);
        const {register} = await import('../ParameterValidator');
        expect(register({account: fakeAccount, profile: fakeProfile})).toBeFalse();
        expect(ClassMock.Account.validate).toBeCalledTimes(1);
        expect(ClassMock.Account.validate).toBeCalledWith(fakeAccount);
        expect(ClassMock.Profile.validate).toBeCalledTimes(1);
        expect(ClassMock.Profile.validate).toBeCalledWith(expect.objectContaining(fakeProfile));
    });

    it('should validate Account and Profile', async function ()
    {
        ClassMock.Account.validate.mockReturnValueOnce(true);
        ClassMock.Profile.validate.mockReturnValueOnce(true);

        ClassMock.Account.validate.mockReturnValueOnce(true);
        ClassMock.Profile.validate.mockReturnValueOnce(false);

        ClassMock.Account.validate.mockReturnValueOnce(false);
        ClassMock.Profile.validate.mockReturnValueOnce(false);

        ClassMock.Account.validate.mockReturnValueOnce(false);
        ClassMock.Profile.validate.mockReturnValueOnce(true);

        const {register} = await import('../ParameterValidator');
        expect(register({account: fakeAccount, profile: fakeProfile})).toBeTrue();
        expect(register({account: fakeAccount, profile: fakeProfile})).toBeFalse();
        expect(register({account: fakeAccount, profile: fakeProfile})).toBeFalse();
        expect(register({account: fakeAccount, profile: fakeProfile})).toBeFalse();
    });
});

describe(`checkPassword`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Class', () => ClassMock);
    });

    it('should call Account.validate', async function ()
    {
        const fakeAccount: Pick<Account, 'hash'> = {hash: 'a'.repeat(64)};
        ClassMock.Account.validate.mockReturnValueOnce(true);
        ClassMock.Account.validate.mockReturnValueOnce(false);
        const {checkPassword} = await import('../ParameterValidator');
        expect(checkPassword(fakeAccount)).toBeTrue();
        expect(checkPassword(fakeAccount)).toBeFalse();
        expect(ClassMock.Account.validate).toBeCalledTimes(2);
        expect(ClassMock.Account.validate).toHaveBeenNthCalledWith(1, expect.objectContaining(fakeAccount));
        expect(ClassMock.Account.validate).toHaveBeenNthCalledWith(2, expect.objectContaining(fakeAccount));
    });
});

describe(`getGroups`, () =>
{
    beforeEach(() =>
    {
        jest.resetAllMocks().resetModules();
        jest.mock('../../../../Class', () => ClassMock);
    });

    it('should call Account.validate', async function ()
    {
        const fakeAccount: Pick<Account, 'username'> = {username: 'faegaegaeg'};
        ClassMock.Account.validate.mockReturnValueOnce(true);
        ClassMock.Account.validate.mockReturnValueOnce(false);
        const {getGroups} = await import('../ParameterValidator');
        expect(getGroups(fakeAccount)).toBeTrue();
        expect(getGroups(fakeAccount)).toBeFalse();
        expect(ClassMock.Account.validate).toBeCalledTimes(2);
        expect(ClassMock.Account.validate).toHaveBeenNthCalledWith(1, expect.objectContaining(fakeAccount));
        expect(ClassMock.Account.validate).toHaveBeenNthCalledWith(2, expect.objectContaining(fakeAccount));
    });
});