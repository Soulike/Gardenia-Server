import {generateParameterizedStatementAndParametersArray} from './Function';

describe(`${generateParameterizedStatementAndParametersArray.name}`, () =>
{
    const obj = {a: 1, b: 2, c: 3, d: 'a'};
    const objValues = Object.values(obj);
    const objKeys = Object.keys(obj);

    it('should generate parameterized statement and corresponding array of parameters with "AND" connection', function ()
    {
        const {parameterizedStatement, parameters} =
            generateParameterizedStatementAndParametersArray(obj, 'AND');
        expect(parameters).toEqual(expect.arrayContaining(objValues));
        let expectedStatement = '';
        for (let i = 0; i < objKeys.length; i++)
        {
            expectedStatement += `"${objKeys[i]}"=$${i + 1} AND `;
        }
        expect(parameterizedStatement).toBe(expectedStatement.slice(0, -5));
    });

    it('should generate parameterized statement and corresponding array of parameters with "," connection', function ()
    {
        const {parameterizedStatement, parameters} =
            generateParameterizedStatementAndParametersArray(obj, ',');
        expect(parameters).toEqual(expect.arrayContaining(objValues));
        let expectedStatement = '';
        for (let i = 0; i < objKeys.length; i++)
        {
            expectedStatement += `"${objKeys[i]}"=$${i + 1} , `;
        }
        expect(parameterizedStatement).toBe(expectedStatement.slice(0, -3));
    });
});