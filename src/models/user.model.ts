import { prop, getModelForClass } from '@typegoose/typegoose';
import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class User {
	@Field()
	@prop({ required: true })
	firstName!: string;

	@Field()
	@prop({ required: true })
	lastName!: string;

	@Field()
	@prop({ required: true, unique: true })
	email!: string;

	@Field()
	@prop({ required: true })
	password!: string;
}

const UserModel = getModelForClass<typeof User>(User);
export default UserModel;
