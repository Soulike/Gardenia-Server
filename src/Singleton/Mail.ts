import nodemailer from 'nodemailer';
import {SERVER} from '../CONFIG';

/**
 * @see https://nodemailer.com/usage/
 * */
const transporter = nodemailer.createTransport({
    pool: true,
    host: 'smtp.qq.com',
    secure: true,
    auth: {
        user: '',
        pass: '',
    },
});

transporter.verify((err) =>
{
    if (err)
    {
        SERVER.ERROR_LOGGER(`邮箱登录失败：\n${err}`);
    }
    else
    {
        SERVER.SUCCESS_LOGGER('邮箱登录成功');
    }
});

export default transporter;