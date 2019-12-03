import {Account} from '../Account';
import crypto from 'crypto';

describe(`${Account.name}`, () =>
{
    const fakeUsername = 'nfioahfioau3t';
    const fakePassword = 'faohf98q2yf9ha';
    const fakeHash = calculateSHA256(calculateSHA256(fakeUsername) + calculateSHA256(fakePassword));

    it(`should construct ${Account.name} object`, function ()
    {
        expect(new Account(fakeUsername, fakeHash)).toEqual({
            username: fakeUsername,
            hash: fakeHash,
        } as Account);
    });

    it(`${Account.from.name} method should return new ${Account.name} object`, function ()
    {
        const account = Account.from({username: fakeUsername, hash: fakeHash});
        expect(account).toBeInstanceOf(Account);
        expect(account).toEqual(new Account(fakeUsername, fakeHash));
    });

    it(`${Account.from.name} method should throw error when source object owns wrong data type`, function ()
    {
        expect(() => Account.from({username: true, hash: fakeHash})).toThrow();
        expect(() => Account.from({username: fakeUsername, hash: 111})).toThrow();
    });

    it(`${Account.validate.name} method should validate data type of source object`, function ()
    {
        expect(Account.validate({username: fakeUsername, hash: fakeHash})).toBe(true);
        expect(Account.validate({username: 22, hash: fakeHash})).toBe(false);
        expect(Account.validate({username: fakeUsername, hash: Symbol()})).toBe(false);
    });

    it(`${Account.calculateHash.name} method should calculate hash`, function ()
    {
        expect(Account.calculateHash(fakeUsername, fakePassword)).toBe(fakeHash);
    });

    function calculateSHA256(text: string): string
    {
        const hash = crypto.createHash('sha256');
        hash.update(text);
        return hash.digest('hex');
    }
});