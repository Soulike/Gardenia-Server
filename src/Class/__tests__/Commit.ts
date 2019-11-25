import {Commit} from '../Commit';
import faker from 'faker';

describe(`${Commit.name}`, () =>
{
    const commitHash = faker.random.alphaNumeric(64);
    const committerName = faker.name.firstName();
    const committerEmail = faker.internet.email();
    const time = faker.date.recent().toString();
    const message = faker.lorem.sentence();

    it(`should construct ${Commit.name} object`, function ()
    {
        expect(new Commit(commitHash, committerName, committerEmail, time, message))
            .toEqual({
                commitHash, committerName, committerEmail, time, message,
            } as Commit);
    });
});