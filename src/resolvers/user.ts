import {
	Query,
	Resolver,
	Mutation,
	Arg,
	UseMiddleware,
	Ctx
} from 'type-graphql';
import UserService from '../services/user.service';
import {
	UserResponse,
	SignUpInput,
	UserListResponse,
	LoginResponse,
	LoginInput,
	MeResponse,
	ForgetPasswordResponse,
	ResetPasswordInput,
	ResetPasswordResponse,
	ChangePasswordResponse,
	ChangePasswordInput
} from '../schemas/user.schema';
import { Context } from '../types/Context';
import { isAuth } from '../middleware/auth';

@Resolver()
export class UserResolver {
	constructor(private userService: UserService) {
		this.userService = new UserService();
	}

	@Query(() => UserListResponse)
	async getAllUsers(): Promise<UserListResponse> {
		const users = await this.userService.getUsers();
		return { status: 'success', users };
	}

	@Mutation(() => UserResponse)
	async signUpUser(@Arg('input') input: SignUpInput): Promise<UserResponse> {
		const user = await this.userService.signUpUser({
			...input,
			createAt: new Date(),
			updateAt: new Date()
		});
		return { status: 'success', user };
	}

	@Mutation(() => LoginResponse)
	async loginUser(@Arg('input') input: LoginInput): Promise<LoginResponse> {
		const data = await this.userService.loginUser(input);
		return { status: 'success', data };
	}

	@Mutation(() => ForgetPasswordResponse)
	async forgotPassword(
		@Arg('email') email: string
	): Promise<ForgetPasswordResponse> {
		const message = await this.userService.forgotPassword(email);
		return { status: 'success', message };
	}

	@Mutation(() => ResetPasswordResponse)
	async resetPassword(
		@Arg('input') input: ResetPasswordInput
	): Promise<ResetPasswordResponse> {
		const message = await this.userService.resetPassword(input);
		return { status: 'success', message };
	}

	@Query(() => MeResponse)
	@UseMiddleware(isAuth)
	async Me(@Ctx() { user }: Context): Promise<MeResponse> {
		const userExists = await this.userService.getMe(user!.id);
		return { status: 'success', user: userExists };
	}

	@Query(() => ChangePasswordResponse)
	@UseMiddleware(isAuth)
	async changePassword(
		@Arg('input') input: ChangePasswordInput,
		@Ctx() { user }: Context
	): Promise<ChangePasswordResponse> {
		const message = await this.userService.changePassword(input, user!.id);
		return { status: 'success', message };
	}
}
