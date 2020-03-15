import nodemailer from 'nodemailer';
import {MAIL, SERVER} from '../CONFIG';

const transporter = nodemailer.createTransport(MAIL);

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