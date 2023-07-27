import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';
import http from 'http';
import { buildSchema } from 'type-graphql';
import 'reflect-metadata';

// Import local modules
import app, { corsOptions } from './app';
import { resolvers } from './resolvers';
import { connect } from './db/dbConnection';

async function startApolloServer() {
	// Load environment variables
	dotenv.config();

	const httpServer = http.createServer(app);

	const schema = await buildSchema({
		resolvers,
		dateScalarMode: 'isoDate'
	});

	const server = new ApolloServer({
		schema,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
		context: ({ req, res }) => ({ req, res }),
		introspection: true
	});

	await server.start();

	server.applyMiddleware({ app, cors: corsOptions });

	const port = process.env.PORT || 4000;
	await new Promise<void>((resolve) => {
		httpServer.listen(port, () => {
			console.log(
				`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`
			);
			resolve();
		});
	});

	connect();

	process.on('unhandledRejection', (err) => {
		console.log('UNHANDLED REJECTION  Shutting down...');
		console.error(err);

		server.stop().then(() => {
			process.exit(1);
		});
	});

	process.on('uncaughtException', (error) => {
		console.log('UNCAUGHT EXCEPTION 🔥🔥 Shutting down...');
		console.error(error);

		server.stop().then(() => process.exit(1));
	});
}

startApolloServer();
