import IORedis from 'ioredis';

// 全局共同的配置，根据各个数据库具体情况的不同在构造时添加配置
export const REDIS: Readonly<IORedis.RedisOptions> = Object.freeze({
    showFriendlyErrorStack: true,
});
