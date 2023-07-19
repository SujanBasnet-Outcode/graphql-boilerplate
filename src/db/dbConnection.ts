import mongoose, { ConnectOptions } from 'mongoose';

export async function connect(): Promise<void> {
	try {
		await mongoose.connect(process.env.MONGO_URI!, {
			useNewUrlParser: true
		} as ConnectOptions);

		console.log('Connected to MongoDB');
	} catch (error) {
		console.error('Error connecting to MongoDB:', error.message);
	}
}
