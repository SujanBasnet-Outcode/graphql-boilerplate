import { Query, Resolver, Mutation, Arg } from 'type-graphql';
import UserService from '../services/user.service';
import {
	UserResponse,
	SignUpInput,
	UserListResponse,
	LoginResponse,
	LoginInput
} from '../schemas/user.schema';

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
}
