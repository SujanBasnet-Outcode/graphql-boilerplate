import { MiddlewareFn } from 'type-graphql';
import { AuthenticationError, UserInputError } from 'apollo-server-core';
import { verifyToken } from '../utils/jwt';
import UserModel from '../models/user.model';
import { Context } from '../types/Context';
import { customMessages } from '../constants/messages';

export const isAuth: MiddlewareFn<Context> = async ({ context }, next) => {
	const authorization = context.req.headers['authorization'];

	if (!authorization) {
		throw new AuthenticationError(customMessages.USER_NOT_AUTHENTICATED);
	}

	try {
		const [, token] = authorization.split(' ');
		if (!token) {
			throw new UserInputError(customMessages.INVALID_TOKEN);
		}

		const payload = await verifyToken(token, process.env.ACCESS_TOKEN_SECRET!);
		if (!payload || !payload.userId) {
			throw new AuthenticationError(customMessages.INVALID_TOKEN);
		}

		const user = await UserModel.findById(payload.userId);
		if (!user) {
			throw new UserInputError(customMessages.USER_NOT_FOUND);
		}

		context.user = user;
	} catch (err) {
		console.error(err);
		throw new AuthenticationError(customMessages.USER_NOT_AUTHENTICATED);
	}

	return next();
};
