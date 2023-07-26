import { Field, InputType, ObjectType } from 'type-graphql';
import { Equals, IsEmail, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { User } from '../models/user.model';
import { customMessages } from '../constants/messages';

@InputType()
export class SignUpInput {
	@Field(() => String)
	firstName: string;

	@Field(() => String)
	lastName: string;

	@IsEmail()
	@Field(() => String)
	email: string;

	@MinLength(8, { message: customMessages.PASSWORD_TOO_SHORT })
	@MaxLength(32, { message: customMessages.PASSWORD_TOO_LONG })
	@Field(() => String)
	password: string;
}

@InputType()
export class LoginInput {
	@IsEmail()
	@Field(() => String)
	email: string;

	@MinLength(8, { message: customMessages.INVALID_EMAIL_OR_PASSWORD })
	@MaxLength(32, { message: customMessages.INVALID_EMAIL_OR_PASSWORD })
	@Field(() => String)
	password: string;
}

@ObjectType()
class LoginData {
	@Field(() => String)
	accessToken: string;

	@Field(() => String)
	refreshToken: string;

	@Field(() => User)
	user: User;
}

@InputType()
export class ResetPasswordInput {
	@Field(() => String)
	password: string;

	@Field(() => String)
	@ValidateIf((o) => o.password !== o.confirmPassword)
	@Equals('password', { message: customMessages.PASSWORDS_NOT_MATCH })
	confirmPassword: string;

	@Field(() => String)
	resetPasswordToken: string;
}

@ObjectType()
export class BaseResponse {
	@Field(() => String)
	status: string;
}

@ObjectType()
export class LoginResponse extends BaseResponse {
	@Field(() => LoginData)
	data: LoginData;
}

@ObjectType()
export class MeResponse extends BaseResponse {
	@Field(() => User)
	user: User;
}

@ObjectType()
export class UserResponse extends BaseResponse {
	@Field(() => User)
	user: User;
}

@ObjectType()
export class UserListResponse extends BaseResponse {
	@Field(() => [User])
	users: User[];
}

@ObjectType()
export class ForgetPasswordResponse extends BaseResponse {
	@Field(() => String)
	message: string;
}

@ObjectType()
export class ResetPasswordResponse extends BaseResponse {
	@Field(() => String)
	message: string;
}
