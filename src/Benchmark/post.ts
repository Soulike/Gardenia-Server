import autocannon from 'autocannon';
import {LOGIN} from '../Dispatcher/Module/Account/ROUTE';
import {Account} from '../Class';

(async () =>
{
    const result = await autocannon({
        url: 'https://git.soulike.tech:8080' + LOGIN,
        method: 'POST',
        body: JSON.stringify(new Account('aefeafeafeaf', 'a'.repeat(64))),
        headers: {'content-type': 'application/json;charset=UTF-8'},
        connections: 300,
        duration: 10,
        timeout: 5,
    });

    console.log(result);
})();