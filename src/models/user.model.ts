import {
	prop,
	getModelForClass,
	pre,
	ModelOptions,
	Severity
} from '@typegoose/typegoose';
import { ObjectType, Field } from 'type-graphql';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

@pre<User>('save', async function (next) {
	if (this.isModified('password')) {
		try {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(this.password, salt);
			this.password = hashedPassword;
		} catch (error) {
			return next(error);
		}
	}
	next();
})
@ModelOptions({ options: { allowMixed: Severity.ALLOW } })
@ObjectType()
export class User {
	@Field()
	readonly id!: string;

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
	@prop({ required: true, select: false })
	password!: string;

	@Field()
	@prop({ required: true })
	createAt!: Date;

	@Field()
	@prop({ required: true })
	updateAt!: Date;

	@Field(() => String, { nullable: true })
	@prop({ required: false, default: null })
	resetPasswordToken?: string | null;

	@Field(() => Date, { nullable: true })
	@prop({ required: false, default: null })
	resetPasswordExpires?: Date | null;

	static async comparePasswords(
		hashedPassword: string,
		candidatePassword: string
	): Promise<boolean> {
		return await bcrypt.compare(candidatePassword, hashedPassword);
	}

	static generateResetPasswordToken(): string {
		// Generate random token
		const resetToken = crypto.randomBytes(32).toString('hex');

		return resetToken;
	}
}

const UserModel = getModelForClass<typeof User>(User);
export default UserModel;
