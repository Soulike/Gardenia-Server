import autocannon from 'autocannon';
import qs from 'querystring';
import {GET_REPOSITORIES} from '../Dispatcher/Module/Repository/ROUTE';

(async () =>
{
    const queryString = qs.encode({
        json: JSON.stringify({
            start: 0,  // 起始索引，从 0 开始
            end: 10,    // 结束索引，不包含在结果内
        }),
    });
    const result = await autocannon({
        url: 'https://git.soulike.tech:8080' + GET_REPOSITORIES + '?' + queryString,
        method: 'GET',
        connections: 300,
        duration: 10,
        timeout: 5,
    });

    console.log(result);
})();