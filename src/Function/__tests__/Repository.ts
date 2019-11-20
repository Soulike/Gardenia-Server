import {repositoryIsAvailableToTheViewer} from '../Repository';
import {Account, Repository} from '../../Class';
import faker from 'faker';

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