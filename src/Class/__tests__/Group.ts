import {Group} from '../Group';
import faker from 'faker';

describe(`${Group.name}`, () =>
{
    const groupId = faker.random.number();
    const groupName = faker.random.word();

    it(`should construct ${Group.name} object`, function ()
    {
        expect(new Group(groupId, groupName)).toEqual({
            id: groupId, name: groupName,
        } as Group);
    });

    it(`${Group.from.name} method should return new ${Group.from.name} object`, function ()
    {
        const group = Group.from({id: groupId, name: groupName});
        expect(group).toBeInstanceOf(Group);
        expect(group).toEqual(new Group(groupId, groupName));
    });

    it(`${Group.from.name} method should throw error when source object owns wrong data type`, function ()
    {
        expect(() => Group.from({id: false, name: groupName})).toThrow();
        expect(() => Group.from({id: groupId, name: {}})).toThrow();
    });

    it(`${Group.validate.name} method should validate data type of source object`, function ()
    {
        expect(Group.validate({id: groupId, name: groupName})).toBe(true);
        expect(Group.validate({id: false, name: groupName})).toBe(false);
        expect(Group.validate({id: groupId, name: {}})).toBe(false);
    });
});