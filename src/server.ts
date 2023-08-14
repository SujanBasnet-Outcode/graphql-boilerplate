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

async function createHttpServer(app: Express.Application) {
	return http.createServer(app);
}

async function createApolloServer(httpServer: http.Server) {
	const schema = await buildSchema({
		resolvers,
		dateScalarMode: 'isoDate'
	});

	return new ApolloServer({
		schema,
		plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
		context: ({ req, res }) => ({ req, res }),
		introspection: true,
		debug: process.env.NODE_ENV !== 'production', // Enable detailed debug logs in non-production environments
		formatError: (err) => {
			console.error(err); // Log errors
			return err;
		}
	});
}

async function startServer(server: ApolloServer, httpServer: http.Server) {
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
}

async function startApolloServer() {
	dotenv.config();

	const httpServer = await createHttpServer(app);
	const server = await createApolloServer(httpServer);

	await startServer(server, httpServer);

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
