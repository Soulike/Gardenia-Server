import {Group} from '../Group';
import faker from 'faker';

describe(Group, () =>
{
    it('should construct group', function ()
    {
        const groupId = faker.random.number();
        const groupName = faker.random.word();
        const group = new Group(groupId, groupName);
        expect(group.id).toEqual(groupId);
        expect(group.name).toEqual(groupName);
    });

    it('should transform object in the same shape', function ()
    {
        const groupId = faker.random.number();
        const groupName = faker.random.word();
        const groupLike = {id: groupId, name: groupName};
        const group = Group.from(groupLike);
        expect(group.id).toEqual(groupId);
        expect(group.name).toEqual(groupName);
    });

    it('should throw error when object in the same shape has wrong value type', function ()
    {
        const groupId = faker.random.word();
        const groupName = faker.random.word();
        const groupLike = {id: groupId, name: groupName};
        expect(() => Group.from(groupLike)).toThrow();
    });
});