import {Client, PoolClient} from 'pg';

/**
 * @description 对数据库事务的包装函数
 * @param client - pg 创建的 Client 实例。根据文档，此处不能是 Pool
 * @param transaction - 要执行的事务
 * */
export async function executeTransaction<T extends Client | PoolClient, R>(client: T, transaction: (client: T) => Promise<R>): Promise<R>
{
    try
    {
        await client.query('START TRANSACTION');
        const queryResult = await transaction(client);    // 传入参数保证事务使用的是同一个 Client 实例
        await client.query('COMMIT');
        return queryResult;
    }
    catch (e)
    {
        await client.query('ROLLBACK');
        throw e;    // 把事务中的错误再次抛出
    }
}

export function generateParameterizedStatementAndValuesArray(parameters: Readonly<{ [key: string]: any }>, connection: 'AND' | ',')
{
    // 移除值为 undefined 的键
    const processedParameters = JSON.parse(JSON.stringify(parameters));
    if (Object.keys(processedParameters).length === 0)
    {
        throw new Error(`Empty parameter object`);
    }
    const values: any[] = [];
    const parameterizedStatements: string[] = [];    // "a"=$1,"b"=$2
    Object.keys(processedParameters).forEach((key, index) =>
    {
        parameterizedStatements.push(`"${key}"=$${index + 1}`);
        values.push(processedParameters[key]);
    });
    return {
        values,
        parameterizedStatement: parameterizedStatements.join(` ${connection} `),
    };
}

export function generateColumnNamesAndValuesArrayAndParameterString(parameters: Readonly<{ [key: string]: any }>)
{
    // 移除值为 undefined 的键
    const processedParameters = JSON.parse(JSON.stringify(parameters));
    if (Object.keys(processedParameters).length === 0)
    {
        throw new Error(`Empty parameter object`);
    }
    const values: any[] = [];
    const columnNames: string[] = [];
    const parameterStrings: string[] = [];
    Object.keys(processedParameters).forEach((key, index) =>
    {
        columnNames.push(`"${key}"`);
        values.push(processedParameters[key]);
        parameterStrings.push(`$${index + 1}`);
    });
    return {
        values,
        columnNames: columnNames.join(','),
        parameterString: parameterStrings.join(','),
    };
}