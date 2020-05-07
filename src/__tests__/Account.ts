import supertest from 'supertest';
import server from '../index';
import {Account as AccountTable} from '../Database';
import {Account, ResponseBody} from '../Class';
import {LOGIN} from '../Dispatcher/Module/Account/ROUTE';

const request = supertest(server);

afterAll(async () =>
{
    return new Promise((resolve, reject) =>
    {
        server.close(err =>
        {
            if (err)
            {
                reject(err);
            }
            else
            {
                resolve();
            }
        });
    });
});

describe('login', () =>
{
    const account = new Account('ab'.repeat(5), 'a'.repeat(64));

    beforeAll(async () =>
    {
        await AccountTable.insert(account);
    });

    afterAll(async () =>
    {
        await AccountTable.deleteByUsername(account.username);
    });

    it('可以处理缺少参数', async function ()
    {
        await request
            .post(LOGIN)
            .send({username: account.username}) // 缺少密码
            .expect(400)
            .expect(JSON.stringify(new ResponseBody(false, '请求参数错误')));
    });

    it('可以处理参数不合法', async function ()
    {
        await request
            .post(LOGIN)
            .send(new Account('a'.repeat(100), account.hash)) // username 不合法
            .expect(400)
            .expect(JSON.stringify(new ResponseBody(false, '请求参数错误')));
    });

    it('可以处理用户不存在', async function ()
    {
        await request
            .post(LOGIN)
            .send(new Account(account.username + 'afwaf', account.hash)) // 用户不存在
            .expect(200)
            .expect(JSON.stringify(new ResponseBody(false, '用户名或密码错误')));
    });

    it('可以处理密码错误', async function ()
    {
        await request
            .post(LOGIN)
            .send(new Account(account.username, 'c'.repeat(64))) // 密码错误
            .expect(200)
            .expect(JSON.stringify(new ResponseBody(false, '用户名或密码错误')));
    });

    it('可以正常登录和设置 cookie', async function ()
    {
        await request
            .post(LOGIN)
            .send(new Account(account.username, account.hash))
            .expect(200)
            .expect('set-cookie', /^.+$/)
            .expect(JSON.stringify(new ResponseBody(true)));
    });
});