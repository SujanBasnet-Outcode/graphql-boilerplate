import { ValidationError, AuthenticationError } from 'apollo-server-core';
import UserModel, { User } from '../models/user.model';
import { LoginInput } from '../schemas/user.schema';
import { signTokens } from '../utils/jwt';
import { customMessages } from '../constants/messages';

export default class UserService {
	async getUsers(): Promise<User[]> {
		try {
			const users = await UserModel.find();
			return users;
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}

	async signUpUser(input: Partial<User>) {
		try {
			const user = await UserModel.create(input);
			return user;
		} catch (err: any) {
			console.log(err);
			if (err.code === 11000) {
				return new ValidationError(customMessages.EMAIL_ALREADY_EXISTS);
			}
			throw err;
		}
	}

	async loginUser(input: LoginInput) {
		try {
			const { email, password } = input;
			const user = await UserModel.findOne({ email }).select('+password');

			if (!user) {
				return new AuthenticationError(customMessages.INVALID_EMAIL_OR_PASSWORD);
			}

			// 2. Compare passwords
			if (!(await UserModel.comparePasswords(user.password, password))) {
				return new AuthenticationError(customMessages.INVALID_EMAIL_OR_PASSWORD);
			}

			const { accessToken, refreshToken } = signTokens(user);

			return { accessToken, refreshToken, user };
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}
}
