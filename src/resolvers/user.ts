import { Query, Resolver, Mutation, Arg, UseMiddleware, Ctx } from 'type-graphql';
import UserService from '../services/user.service';
import {
	UserResponse,
	SignUpInput,
	UserListResponse,
	LoginResponse,
	LoginInput,
	MeResponse,
	ForgetPasswordResponse
} from '../schemas/user.schema';
import { Context } from '../types/Context';
import { isAuth } from '../middleware/auth';

@Resolver()
export class UserResolver {
	constructor(private userService: UserService) {
		this.userService = new UserService();
	}

	@Query(() => UserListResponse)
	async getAllUsers() {
		const users = await this.userService.getUsers();
		return { status: 'success', users };
	}

	@Mutation(() => UserResponse)
	async signUpUser(@Arg('input') input: SignUpInput) {
		const user = await this.userService.signUpUser({
			...input,
			createAt: new Date(),
			updateAt: new Date()
		});
		return { status: 'success', user };
	}

	@Mutation(() => LoginResponse)
	async loginUser(@Arg('input') input: LoginInput) {
		const data = await this.userService.loginUser(input);
		return { status: 'success', data };
	}

	@Mutation(() => ForgetPasswordResponse)
	async forgotPassword(@Arg('email') email: string) {
		const message = await this.userService.forgotPassword(email);
		return { status: 'success', message };
	}

	@Query(() => MeResponse)
	@UseMiddleware(isAuth)
	async Me(@Ctx() { user }: Context) {
		const userExists = await this.userService.getMe(user!.id);
		return { status: 'success', user: userExists };
	}
}
