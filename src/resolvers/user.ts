import { Query, Resolver } from 'type-graphql';
import UserModel, { User } from '../models/user.model';

@Resolver()
export class UserResolver {
	@Query(() => [User])
	async getAllUsers(): Promise<User[]> {
		const users = await UserModel.find();

		return users;
	}
}
