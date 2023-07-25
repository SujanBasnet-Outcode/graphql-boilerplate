import { Field, InputType, ObjectType } from 'type-graphql';
import { IsEmail, MaxLength, MinLength } from 'class-validator';
import { User } from '../models/user.model';
import { customMessages } from '../constants/messages';

@ObjectType()
export class BaseResponse {
	@Field(() => String)
	status: string;
}

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
class LoginData {
	@Field(() => String)
	accessToken: string;

	@Field(() => String)
	refreshToken: string;

	@Field(() => User)
	user: User;
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
