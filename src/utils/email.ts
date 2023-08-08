import nodemailer, { SentMessageInfo } from 'nodemailer';
import { emailConfig } from '../config/mail.config';

export interface MailOptions {
	to: string;
	subject: string;
	text: string;
	html: string;
}

export async function sendEmail(
	options: MailOptions
): Promise<SentMessageInfo> {
	// create reusable transporter object using the default SMTP transport
	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: emailConfig.auth.user,
			pass: emailConfig.auth.pass
		},
		host: emailConfig.host,
		port: Number(emailConfig.port)
	});

	// send mail with defined transport object
	const info = await transporter.sendMail({
		from: `"GRAPHQL 👻" <${emailConfig.auth.user}>`, // sender address
		to: options.to,
		subject: options.subject,
		text: options.text,
		html: options.html
	});

	return info;
}
