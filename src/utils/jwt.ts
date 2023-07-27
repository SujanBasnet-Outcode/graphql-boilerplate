import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models/user.model';
import dotenv from 'dotenv';
dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;

interface Payload {
	userId: string;
	email: string;
}

export const createToken = async (
	payload: Payload,
	secret: string,
	options?: SignOptions
): Promise<string> => {
	const token = await jwt.sign(payload, secret, options);
	return token;
};

export const verifyToken = async (
	token: string,
	secret: string
): Promise<Payload | null> => {
	try {
		const decoded = (await jwt.verify(token, secret)) as Payload;
		return decoded;
	} catch (err) {
		console.error(err);
		return null;
	}
};

export const signTokens = async (
	user: User
): Promise<Record<string, string>> => {
	const userId: string = user.id.toString();
	const payload: Payload = { userId, email: user.email };

	const accessToken = await createToken(payload, ACCESS_TOKEN_SECRET, {
		expiresIn: `60m`
	});
	const refreshToken = await createToken(payload, REFRESH_TOKEN_SECRET, {
		expiresIn: `2d`
	});

	return { accessToken, refreshToken };
};
