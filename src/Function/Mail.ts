import {SendMailOptions} from 'nodemailer';
import {mail} from '../Singleton';
import {MAIL} from '../CONFIG';

export async function sendMail(options: Omit<SendMailOptions, 'from' | 'sender'>): Promise<void>
{
    await mail.sendMail({
        from: {
            name: 'Gardenia 开发者',
            address: MAIL.auth.user,
        },
        ...options,
    });
}