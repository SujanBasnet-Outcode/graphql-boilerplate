import { User } from '../models/user.model';
import { BaseRepository } from './base.repository';

class UserRepositoryClass extends BaseRepository<User> {
	constructor() {
		super(User);
	}
}

const UserRepository = new UserRepositoryClass();
export default UserRepository;
