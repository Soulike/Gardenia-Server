import {Account, Group, Repository} from '../../../../Class';
import {
    addToGroup,
    commitCount,
    directory,
    fileInfo,
    groups,
    lastCommit,
    rawFile,
    repository,
    setDescription,
    setIsPublic,
    setName,
} from '../ParameterValidator';
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

describe('directory', () =>
{
    it('should handle body without account', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            directoryPath: string,
        } = {
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            directoryPath: 'faefaef',
        };
        expect(directory(fakeBody)).toBeFalse();
    });

    it('should handle body with account (null)', function ()
    {
        const fakeBody: {
            account: null,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            directoryPath: string,
        } = {
            account: null,
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            directoryPath: 'faefaef',
        };
        expect(directory(fakeBody)).toBeFalse();
    });

    it('should handle body with account.username (not a string)', function ()
    {
        const fakeBody: {
            account: Record<keyof Pick<Account, 'username'>, any>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            directoryPath: string,
        } = {
            account: {username: 2552},
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            directoryPath: 'faefaef',
        };
        expect(directory(fakeBody)).toBeFalse();
    });

    it('should handle body without repository', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            commitHash: string,
            directoryPath: string,
        } = {
            account: {username: '2552'},
            commitHash: 'faefgae',
            directoryPath: 'faefaef',
        };
        expect(directory(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: null,
            commitHash: string,
            directoryPath: string,
        } = {
            account: {username: '2552'},
            repository: null,
            commitHash: 'faefgae',
            directoryPath: 'faefaef',
        };
        expect(directory(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Record<keyof Pick<Repository, 'name'>, any>,
            commitHash: string,
            directoryPath: string,
        } = {
            account: {username: '2552'},
            repository: {name: true},
            commitHash: 'faefgae',
            directoryPath: 'faefaef',
        };
        expect(directory(fakeBody)).toBeFalse();
    });

    it('should handle body with commitHash (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: any,
            directoryPath: string,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: 1111,
            directoryPath: 'faefaef',
        };
        expect(directory(fakeBody)).toBeFalse();
    });

    it('should handle body with directoryPath (string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            directoryPath: string,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: '1111',
            directoryPath: 'fagfaegaeg',
        };
        expect(directory(fakeBody)).toBeTrue();
    });

    it('should handle body with directoryPath (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            directoryPath: any,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: '1111',
            directoryPath: 255235,
        };
        expect(directory(fakeBody)).toBeFalse();
    });
});

describe('commitCount', () =>
{
    it('should handle body without account', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name'>,
            commitHash: string,
        } = {
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
        };
        expect(commitCount(fakeBody)).toBeFalse();
    });

    it('should handle body with account (null)', function ()
    {
        const fakeBody: {
            account: null,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
        } = {
            account: null,
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
        };
        expect(commitCount(fakeBody)).toBeFalse();
    });

    it('should handle body with account.username (not a string)', function ()
    {
        const fakeBody: {
            account: Record<keyof Pick<Account, 'username'>, any>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
        } = {
            account: {username: 2552},
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
        };
        expect(commitCount(fakeBody)).toBeFalse();
    });

    it('should handle body without repository', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            commitHash: string,
        } = {
            account: {username: '2552'},
            commitHash: 'faefgae',
        };
        expect(commitCount(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: null,
            commitHash: string,
        } = {
            account: {username: '2552'},
            repository: null,
            commitHash: 'faefgae',
        };
        expect(commitCount(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Record<keyof Pick<Repository, 'name'>, any>,
            commitHash: string,
        } = {
            account: {username: '2552'},
            repository: {name: true},
            commitHash: 'faefgae',
        };
        expect(commitCount(fakeBody)).toBeFalse();
    });

    it('should handle body with commitHash (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: any,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: 1111,
        };
        expect(commitCount(fakeBody)).toBeFalse();
    });

    it('should handle body', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: '1111',
        };
        expect(commitCount(fakeBody)).toBeTrue();
    });

});

describe('fileInfo', () =>
{
    it('should handle body without account', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath: string,
        } = {
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(fileInfo(fakeBody)).toBeFalse();
    });

    it('should handle body with account (null)', function ()
    {
        const fakeBody: {
            account: null,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath: string,
        } = {
            account: null,
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(fileInfo(fakeBody)).toBeFalse();
    });

    it('should handle body with account.username (not a string)', function ()
    {
        const fakeBody: {
            account: Record<keyof Pick<Account, 'username'>, any>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath: string,
        } = {
            account: {username: 2552},
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(fileInfo(fakeBody)).toBeFalse();
    });

    it('should handle body without repository', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            commitHash: string,
            filePath: string,
        } = {
            account: {username: '2552'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(fileInfo(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: null,
            commitHash: string,
            filePath: string,
        } = {
            account: {username: '2552'},
            repository: null,
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(fileInfo(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Record<keyof Pick<Repository, 'name'>, any>,
            commitHash: string,
            filePath: string,
        } = {
            account: {username: '2552'},
            repository: {name: true},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(fileInfo(fakeBody)).toBeFalse();
    });

    it('should handle body with commitHash (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: any,
            filePath: string,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: 1111,
            filePath: 'faefaef',
        };
        expect(fileInfo(fakeBody)).toBeFalse();
    });

    it('should handle body with filePath (string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath: string,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: '1111',
            filePath: 'fagfaegaeg',
        };
        expect(fileInfo(fakeBody)).toBeTrue();
    });

    it('should handle body with filePath (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath: any,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: '1111',
            filePath: 255235,
        };
        expect(fileInfo(fakeBody)).toBeFalse();
    });
});

describe('rawFile', () =>
{
    it('should handle body without account', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath: string,
        } = {
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(rawFile(fakeBody)).toBeFalse();
    });

    it('should handle body with account (null)', function ()
    {
        const fakeBody: {
            account: null,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath: string,
        } = {
            account: null,
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(rawFile(fakeBody)).toBeFalse();
    });

    it('should handle body with account.username (not a string)', function ()
    {
        const fakeBody: {
            account: Record<keyof Pick<Account, 'username'>, any>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath: string,
        } = {
            account: {username: 2552},
            repository: {name: 'faefgaeg'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(rawFile(fakeBody)).toBeFalse();
    });

    it('should handle body without repository', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            commitHash: string,
            filePath: string,
        } = {
            account: {username: '2552'},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(rawFile(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: null,
            commitHash: string,
            filePath: string,
        } = {
            account: {username: '2552'},
            repository: null,
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(rawFile(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Record<keyof Pick<Repository, 'name'>, any>,
            commitHash: string,
            filePath: string,
        } = {
            account: {username: '2552'},
            repository: {name: true},
            commitHash: 'faefgae',
            filePath: 'faefaef',
        };
        expect(rawFile(fakeBody)).toBeFalse();
    });

    it('should handle body with commitHash (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: any,
            filePath: string,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: 1111,
            filePath: 'faefaef',
        };
        expect(rawFile(fakeBody)).toBeFalse();
    });

    it('should handle body with filePath (string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath: string,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: '1111',
            filePath: 'fagfaegaeg',
        };
        expect(rawFile(fakeBody)).toBeTrue();
    });

    it('should handle body with filePath (not a string)', function ()
    {
        const fakeBody: {
            account: Pick<Account, 'username'>,
            repository: Pick<Repository, 'name'>,
            commitHash: string,
            filePath: any,
        } = {
            account: {username: '2552'},
            repository: {name: 'faegfaeg'},
            commitHash: '1111',
            filePath: 255235,
        };
        expect(rawFile(fakeBody)).toBeFalse();
    });
});

describe('setName', () =>
{
    it('should handle body without repository', function ()
    {
        const fakeBody: {
            newRepository: Pick<Repository, 'name'>,
        } = {
            newRepository: {
                name: 'faefeaf',
            },
        };
        expect(setName(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: {
            repository: null,
            newRepository: Pick<Repository, 'name'>,
        } = {
            repository: null,
            newRepository: {
                name: 'faefeaf',
            },
        };
        expect(setName(fakeBody)).toBeFalse();
    });

    it('should handle body without newRepository', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name'>,
        } = {
            repository: {
                name: 'faefaef',
            },
        };
        expect(setName(fakeBody)).toBeFalse();
    });

    it('should handle body with newRepository (null)', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name'>,
            newRepository: null,
        } = {
            repository: {
                name: 'faefaef',
            },
            newRepository: null,
        };
        expect(setName(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            repository: Record<keyof Pick<Repository, 'name'>, any>,
            newRepository: Pick<Repository, 'name'>,
        } = {
            repository: {
                name: 643,
            },
            newRepository: {
                name: 'faefeaf',
            },
        };
        expect(setName(fakeBody)).toBeFalse();
    });

    it('should handle body with newRepository.name (not a string)', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name'>,
            newRepository: Record<keyof Pick<Repository, 'name'>, any>,
        } = {
            repository: {
                name: 'faefaef',
            },
            newRepository: {
                name: false,
            },
        };
        expect(setName(fakeBody)).toBeFalse();
    });

    it('should handle body', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name'>,
            newRepository: Pick<Repository, 'name'>,
        } = {
            repository: {
                name: 'faefaef',
            },
            newRepository: {
                name: 'faefeaf',
            },
        };
        expect(setName(fakeBody)).toBeTrue();
    });
});

describe('setDescription', () =>
{
    it('should handle body without repository', function ()
    {
        const fakeBody: {} = {};
        expect(setDescription(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: { repository: null, } = {repository: null};
        expect(setDescription(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            repository: Record<keyof Pick<Repository, 'name'>, any> & Pick<Repository, 'description'>,
        } = {
            repository: {
                name: 111,
                description: 'fgaegae',
            },
        };
        expect(setDescription(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.description (not a string)', function ()
    {
        const fakeBody: {
            repository: Record<keyof Pick<Repository, 'description'>, any> & Pick<Repository, 'name'>,
        } = {
            repository: {
                name: 'faefea',
                description: 111,
            },
        };
        expect(setDescription(fakeBody)).toBeFalse();
    });

    it('should handle body', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name' | 'description'>,
        } = {
            repository: {
                name: 'faefea',
                description: 'fgaegae',
            },
        };
        expect(setDescription(fakeBody)).toBeTrue();
    });
});

describe('setIsPublic', () =>
{
    it('should handle body without repository', function ()
    {
        const fakeBody: {} = {};
        expect(setIsPublic(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: { repository: null, } = {repository: null};
        expect(setIsPublic(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            repository: Record<keyof Pick<Repository, 'name'>, any> & Pick<Repository, 'isPublic'>,
        } = {
            repository: {
                name: 111,
                isPublic: false,
            },
        };
        expect(setIsPublic(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.isPublic (not a boolean)', function ()
    {
        const fakeBody: {
            repository: Record<keyof Pick<Repository, 'isPublic'>, any> & Pick<Repository, 'name'>,
        } = {
            repository: {
                name: 'faefea',
                isPublic: 111,
            },
        };
        expect(setIsPublic(fakeBody)).toBeFalse();
    });

    it('should handle body', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'name' | 'isPublic'>,
        } = {
            repository: {
                name: 'faefea',
                isPublic: true,
            },
        };
        expect(setIsPublic(fakeBody)).toBeTrue();
    });
});

describe('groups', () =>
{
    it('should handle body without repository', function ()
    {
        const fakeBody: {} = {};
        expect(groups(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: { repository: null, } = {repository: null};
        expect(groups(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.username (not a string)', function ()
    {
        const fakeBody: {
            repository: Record<keyof Pick<Repository, 'username'>, any> & Pick<Repository, 'name'>,
        } = {
            repository: {
                username: 111,
                name: 'faefgae',
            },
        };
        expect(groups(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            repository: Record<keyof Pick<Repository, 'name'>, any> & Pick<Repository, 'username'>,
        } = {
            repository: {
                username: 'feaf',
                name: false,
            },
        };
        expect(groups(fakeBody)).toBeFalse();
    });

    it('should handle body', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'username' | 'name'>,
        } = {
            repository: {
                username: 'feaf',
                name: 'faefgae',
            },
        };
        expect(groups(fakeBody)).toBeTrue();
    });
});

describe('addToGroup', () =>
{
    it('should handle body without repository', function ()
    {
        const fakeBody: {
            group: Pick<Group, 'id'>,
        } = {
            group: {
                id: 2,
            },
        };
        expect(addToGroup(fakeBody)).toBeFalse();
    });

    it('should handle body with repository (null)', function ()
    {
        const fakeBody: {
            repository: null,
            group: Pick<Group, 'id'>,
        } = {
            repository: null,
            group: {
                id: 2,
            },
        };
        expect(addToGroup(fakeBody)).toBeFalse();
    });

    it('should handle body without group', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'username' | 'name'>,
        } = {
            repository: {
                username: 'faefae',
                name: 'feafaef',
            },
        };
        expect(addToGroup(fakeBody)).toBeFalse();
    });

    it('should handle body with group (null)', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'username' | 'name'>,
            group: null,
        } = {
            repository: {
                username: 'faefae',
                name: 'feafaef',
            },
            group: null,
        };
        expect(addToGroup(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.username (not a string)', function ()
    {
        const fakeBody: {
            repository: Record<keyof Pick<Repository, 'username'>, any> & Pick<Repository, 'name'>,
            group: Pick<Group, 'id'>,
        } = {
            repository: {
                username: 111,
                name: 'feafaef',
            },
            group: {
                id: 2,
            },
        };
        expect(addToGroup(fakeBody)).toBeFalse();
    });

    it('should handle body with repository.name (not a string)', function ()
    {
        const fakeBody: {
            repository: Record<keyof Pick<Repository, 'name'>, any> & Pick<Repository, 'username'>,
            group: Pick<Group, 'id'>,
        } = {
            repository: {
                username: 'faefae',
                name: false,
            },
            group: {
                id: 2,
            },
        };
        expect(addToGroup(fakeBody)).toBeFalse();
    });

    it('should handle body with group.id (not a number)', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'username' | 'name'>,
            group: Record<keyof Pick<Group, 'id'>, any>,
        } = {
            repository: {
                username: 'faefae',
                name: 'feafaef',
            },
            group: {
                id: 'gaegae',
            },
        };
        expect(addToGroup(fakeBody)).toBeFalse();
    });

    it('should handle body', function ()
    {
        const fakeBody: {
            repository: Pick<Repository, 'username' | 'name'>,
            group: Pick<Group, 'id'>,
        } = {
            repository: {
                username: 'faefae',
                name: 'feafaef',
            },
            group: {
                id: 2,
            },
        };
        expect(addToGroup(fakeBody)).toBeTrue();
    });
});