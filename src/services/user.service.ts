import { ValidationError, AuthenticationError } from 'apollo-server-core';
import {
	LoginData,
	LoginInput,
	ResetPasswordInput
} from '../schemas/user.schema';
import { signTokens } from '../utils/jwt';
import { customMessages } from '../constants/messages';
import UserRepository from '../repositories/user.repository';
import UserModel, { User } from '../models/user.model';

export default class UserService {
	async getUserProfile(condition: Partial<User>) {
		const user = await UserRepository.findOne(condition);

		if (!user) {
			throw new AuthenticationError(customMessages.USER_NOT_FOUND);
		}

		return user;
	}

	async getUsers(): Promise<User[]> {
		try {
			const users: User[] = await UserRepository.findAll({});
			return users;
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}

	async signUpUser(userCredentials: Partial<User>): Promise<User> {
		try {
			const user = await UserRepository.create(userCredentials);
			return user;
		} catch (err: any) {
			console.log(err);
			if (err.code === 11000) {
				throw new ValidationError(customMessages.EMAIL_ALREADY_EXISTS);
			}
			throw err;
		}
	}

	async loginUser(input: LoginInput): Promise<LoginData> {
		const { email, password } = input;
		try {
			const user = await this.getUserProfile({ email });

			const passwordsMatch = await UserModel.comparePasswords(
				user.password,
				password
			);
			if (!passwordsMatch)
				throw new AuthenticationError(customMessages.INVALID_EMAIL_OR_PASSWORD);

			const { accessToken, refreshToken } = await signTokens(user);
			return { accessToken, refreshToken, user };
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}

	async getMe(id: string): Promise<User> {
		try {
			const user = await UserRepository.findById(id);
			if (!user) throw new AuthenticationError(customMessages.USER_NOT_FOUND);

			return user;
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}

	async forgotPassword(email: string): Promise<string> {
		try {
			const user = await this.getUserProfile({ email });

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

	async resetPassword({
		password,
		resetPasswordToken
	}: ResetPasswordInput): Promise<string> {
		try {
			const user = await this.getUserProfile({ resetPasswordToken });

			// 2. Check if token has expired
			if (user.resetPasswordExpires! < new Date(Date.now())) {
				throw new AuthenticationError(customMessages.RESET_TOKEN_EXPIRED);
			}

			user.password = password;
			user.resetPasswordToken = undefined;
			user.resetPasswordExpires = undefined;

			await user.save();

			return customMessages.RESET_PASSWORD_SUCCESS;
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}
}
