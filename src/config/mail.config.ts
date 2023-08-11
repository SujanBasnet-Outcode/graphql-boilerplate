import dotenv from 'dotenv';
dotenv.config();

export const emailConfig = {
	host: process.env.SMTP_HOST!,
	port: process.env.SMTP_PORT!,
	auth: {
		user: process.env.SMTP_AUTH_USER!,
		pass: process.env.SMTP_AUTH_PASS!
	}
};
