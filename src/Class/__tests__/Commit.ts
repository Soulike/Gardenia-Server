import {Commit} from '../Commit';

describe(`${Commit.name}`, () =>
{
    const commitHash = '4'.repeat(64);
    const committerName = 'fiaiyugtfaou';
    const committerEmail = 'a@b.com';
    const time = (new Date()).toString();
    const message = 'dnaioy3t0h98ayt908a38';

    it(`should construct ${Commit.name} object`, function ()
    {
        expect(new Commit(commitHash, committerName, committerEmail, time, message))
            .toEqual({
                commitHash, committerName, committerEmail, time, message,
            } as Commit);
    });
});