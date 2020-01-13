import {Account, Repository} from '../../../../Class';
import {lastCommit, repository} from '../ParameterValidator';
import 'jest-extended';

describe('repository', () =>
{
    it('should handle body without account', function ()
    {
        const fakeBody: { repository: Pick<Repository, 'name'>, } = {
            repository: {name: 'faefae'},
        };
        expect(repository(fakeBody)).toBeFalse();
    });

    it('should handle body with account (null)', function ()
    {
        const fakeBody: { account: null, repository: Pick<Repository, 'name'>, } = {
            account: null,
            repository: {name: 'faefae'},
        };
        expect(repository(fakeBody)).toBeFalse();
    });

    it('should handle body without repository', function ()
    {
        const fakeBody: { account: Pick<Account, 'username'>, } = {
            account: {username: 'faefea'},
        };
        expect(repository(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: { account: Pick<Account, 'username'>, repository: null } = {
            account: {username: 'faefea'}, repository: null,
        };
        expect(repository(fakeBody)).toBeFalse();
    });

    it('should handle body with account.username (not a string)', function ()
    {
        const fakeBody: {
            account: Record<keyof Pick<Account, 'username'>, any>,
            repository: Pick<Repository, 'name'>,
        } = {
            account: {
                username: 1,
            },
            repository: {name: 'faefae'},
        };
        expect(repository(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Record<keyof Pick<Repository, 'name'>, any>,
        } = {
            account: {
                username: 'faefaef',
            },
            repository: {name: Symbol()},
        };
        expect(repository(fakeBody)).toBeFalse();
    });

    it('should handle body', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
        } = {
            account: {
                username: 'faefaef',
            },
            repository: {name: 'faegaeg'},
        };
        expect(repository(fakeBody)).toBeTrue();
    });
});

describe('lastCommit', () =>
{
    it('should handle body without account', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath?: string,
        } = {
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(lastCommit(fakeBody)).toBeFalse();
    });

    it('should handle body with account (null)', function ()
    {
        const fakeBody: {
            account: null,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath?: string,
        } = {
            account: null,
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(lastCommit(fakeBody)).toBeFalse();
    });

    it('should handle body with account.username (not a string)', function ()
    {
        const fakeBody: {
            account: Record<keyof Pick<Account, 'username'>, any>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath?: string,
        } = {
            account: {username: 2552},
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(lastCommit(fakeBody)).toBeFalse();
    });

    it('should handle body without repository', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            commitHash: string,
            filePath?: string,
        } = {
            account: {username: '2552'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(lastCommit(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: null,
            commitHash: string,
            filePath?: string,
        } = {
            account: {username: '2552'},
            repository: null,
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(lastCommit(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Record<keyof Pick<Repository, 'name'>, any>,
            commitHash: string,
            filePath?: string,
        } = {
            account: {username: '2552'},
            repository: {name: true},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(lastCommit(fakeBody)).toBeFalse();
    });

    it('should handle body with commitHash (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: any,
            filePath?: string,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: 1111,
            filePath: 'faefaef',
        };
        expect(lastCommit(fakeBody)).toBeFalse();
    });

    it('should handle body with filePath (undefined)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath?: string,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: '1111',
        };
        expect(lastCommit(fakeBody)).toBeTrue();
    });

    it('should handle body with filePath (string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath?: string,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: '1111',
            filePath: 'fagfaegaeg',
        };
        expect(lastCommit(fakeBody)).toBeTrue();
    });

    it('should handle body with filePath (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath?: any,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: '1111',
            filePath: 255235,
        };
        expect(lastCommit(fakeBody)).toBeFalse();
    });
});