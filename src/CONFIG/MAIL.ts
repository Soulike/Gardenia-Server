/**
 * @see https://nodemailer.com/usage/
 * */
export const MAIL = Object.freeze({
    pool: true,
    host: '',
    secure: true,
    auth: {
        user: '',  // 这里必须填写完整的邮件地址，否则可能会导致发不出去邮件
        pass: '',
    },
});