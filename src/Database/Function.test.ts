import {
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from './Function';

describe(`${generateParameterizedStatementAndValuesArray.name}`, () =>
{
    const obj = {a: 1, b: 2, c: 3, d: 'a', e: undefined};
    const objValues = Object.values(JSON.parse(JSON.stringify(obj)));

    it('should generate parameterized statement and corresponding array of values with "AND" connection', function ()
    {
        const {parameterizedStatement, values} =
            generateParameterizedStatementAndValuesArray(obj, 'AND');
        expect(values).toEqual(objValues);
        const expectedStatement = '"a"=$1 AND "b"=$2 AND "c"=$3 AND "d"=$4';
        expect(parameterizedStatement).toBe(expectedStatement);
    });

    it('should generate parameterized statement and corresponding array of values with "," connection', function ()
    {
        const {parameterizedStatement, values} =
            generateParameterizedStatementAndValuesArray(obj, ',');
        expect(values).toEqual(objValues);
        const expectedStatement = '"a"=$1 , "b"=$2 , "c"=$3 , "d"=$4';
        expect(parameterizedStatement).toBe(expectedStatement);
    });

    it('should throw error when parameter object is empty', function ()
    {
        expect(
            () => generateParameterizedStatementAndValuesArray({}, ','))
            .toThrow();
        expect(
            () => generateParameterizedStatementAndValuesArray({}, 'AND'))
            .toThrow();
        expect(
            () => generateParameterizedStatementAndValuesArray({a: undefined}, ','))
            .toThrow();
    });
});

describe(`${generateColumnNamesAndValuesArrayAndParameterString.name}`, () =>
{
    it('should generate columns\' names, values array and parameter string', async function ()
    {
        const obj = {a: 1, b: 2, c: 3, d: 'a', e: undefined};
        const objValues = Object.values(JSON.parse(JSON.stringify(obj)));
        const expectedColumnNames = '"a","b","c","d"';
        const expectedParameterString = '$1,$2,$3,$4';
        const {values, columnNames, parameterString} = generateColumnNamesAndValuesArrayAndParameterString(obj);
        expect(values).toEqual(objValues);
        expect(columnNames).toBe(expectedColumnNames);
        expect(parameterString).toBe(expectedParameterString);
    });

    it('should throw error when parameter object is empty', function ()
    {
        expect(() => generateColumnNamesAndValuesArrayAndParameterString({}))
            .toThrow();
        expect(() => generateColumnNamesAndValuesArrayAndParameterString({}))
            .toThrow();
        expect(
            () => generateColumnNamesAndValuesArrayAndParameterString({a: undefined}))
            .toThrow();
    });
});