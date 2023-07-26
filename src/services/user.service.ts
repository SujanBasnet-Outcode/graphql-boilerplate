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
			if (!user) return new AuthenticationError(customMessages.INVALID_EMAIL_OR_PASSWORD);

			const passwordsMatch = await UserModel.comparePasswords(user.password, password);
			if (!passwordsMatch) return new AuthenticationError(customMessages.INVALID_EMAIL_OR_PASSWORD);

			const { accessToken, refreshToken } = signTokens(user);
			return { accessToken, refreshToken, user };
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}

	async getMe(id: string) {
		try {
			const user = await UserModel.findById(id);
			if (!user) return new AuthenticationError(customMessages.USER_NOT_FOUND);

			return user;
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}

	async forgotPassword(email: string) {
		try {
			const user = await UserModel.findOne({ email });
			if (!user) return new AuthenticationError(customMessages.USER_NOT_FOUND);

			const resetToken = await UserModel.generateResetPasswordToken();

			user.resetPasswordToken = resetToken;
			user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

			await user.save();

			// need to send this token to user's email future work
			const message = `Use this as a resetPasswordToken: ${resetToken}`;

			return message;
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}
}
