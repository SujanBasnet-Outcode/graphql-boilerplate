import mongoose, { ConnectOptions } from 'mongoose';

export async function connect(): Promise<void> {
	try {
		// Add a delay here before connecting (e.g., setTimeout)
		await new Promise((resolve) => setTimeout(resolve, 3000));

		await mongoose.connect(process.env.MONGO_URI!, {
			useNewUrlParser: true
		} as ConnectOptions);

		console.log('Connected to MongoDB');
	} catch (error) {
		console.log(error);
		console.error('Error connecting to MongoDB:', error.message);
	}
}
