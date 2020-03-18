import {
    generateColumnNamesAndValuesArrayAndParameterString,
    generateParameterizedStatementAndValuesArray,
} from './Function';

describe('generateParameterizedStatementAndValuesArray', () =>
{
    const obj = {a: 1, b: 2, c: 3, d: 'a', e: undefined};
    const objValues = Object.values(JSON.parse(JSON.stringify(obj)));

    it('应当生成 "AND" 连接的参数字符串且返回正确参数数组', function ()
    {
        const {parameterizedStatement, values} =
            generateParameterizedStatementAndValuesArray(obj, 'AND');
        expect(values).toEqual(objValues);
        const expectedStatement = '"a"=$1 AND "b"=$2 AND "c"=$3 AND "d"=$4';
        expect(parameterizedStatement).toBe(expectedStatement);
    });

    it('应当生成 "," 连接的参数字符串且返回正确参数数组', function ()
    {
        const {parameterizedStatement, values} =
            generateParameterizedStatementAndValuesArray(obj, ',');
        expect(values).toEqual(objValues);
        const expectedStatement = '"a"=$1 , "b"=$2 , "c"=$3 , "d"=$4';
        expect(parameterizedStatement).toBe(expectedStatement);
    });

    it('应当在传入对象没有有效键值对时抛出错误', function ()
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

describe('generateColumnNamesAndValuesArrayAndParameterString', () =>
{
    it('应当生产列名串及对应的参数串', function ()
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

    it('应当在传入对象没有有效键值对时抛出错误', function ()
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