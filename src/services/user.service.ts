import { ValidationError, AuthenticationError } from 'apollo-server-core';
import {
	ChangePasswordInput,
	LoginData,
	LoginInput,
	ResetPasswordInput
} from '../schemas/user.schema';
import { signTokens } from '../utils/jwt';
import { customMessages } from '../constants/messages';
import UserRepository from '../repositories/user.repository';
import UserModel, { User } from '../models/user.model';
import { sendEmail } from '../utils/email';

export default class UserService {
	async getUserProfile(condition: Partial<User>) {
		const user = await UserRepository.findOne(condition);

		if (!user) {
			throw new AuthenticationError(customMessages.USER_NOT_FOUND);
		}

		return user;
	}

	async getUserProfileWithPassword(condition: Partial<User>) {
		const user = await UserRepository.findOne(condition, '+password');

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

	async getUser(id: string): Promise<User> {
		try {
			const user = await UserRepository.findById(id);
			if (!user) throw new AuthenticationError(customMessages.USER_NOT_FOUND);
			return user;
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}

	async updateUser(id: string, userCredentials: Partial<User>): Promise<User> {
		try {
			const user = await UserRepository.findByIdAndUpdate(id, userCredentials);
			if (!user) throw new AuthenticationError(customMessages.USER_NOT_FOUND);
			return user;
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
			const user = await this.getUserProfileWithPassword({ email });
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

			sendEmail({
				to: 'sujanbasnet5426@gmail.com',
				subject: 'Reset Password',
				text: message,
				html: `<p>${message}</p>`
			});
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
			const user = await this.getUserProfileWithPassword({
				resetPasswordToken
			});

			// 2. Check if token has expired
			const hasTokenExpired = user.resetPasswordExpires! < new Date(Date.now());
			if (hasTokenExpired) {
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

	async changePassword(
		{ oldPassword, newPassword }: ChangePasswordInput,
		userId: string
	): Promise<string> {
		try {
			const user = await this.getUserProfileWithPassword({ id: userId });

			const passwordsMatch = await UserModel.comparePasswords(
				user.password,
				oldPassword
			);
			if (!passwordsMatch)
				throw new AuthenticationError(customMessages.CHANGE_PASSWORD_INVALID);

			user.password = newPassword;
			await user.save();

			return customMessages.CHANGE_PASSWORD_SUCCESS;
		} catch (err: any) {
			console.log(err);
			throw err;
		}
	}
}
