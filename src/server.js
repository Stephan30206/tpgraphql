import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import 'dotenv/config';

import typeDefs from './schema/typeDefs.js';
import resolvers from './resolvers/index.js';
import { context } from './context/index.js';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  // Affiche les erreurs détaillées en développement
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
});

const { url } = await startStandaloneServer(server, {
  context,
  listen: { port: process.env.PORT || 4000 },
});

console.log(`🚀 Serveur GraphQL prêt sur : ${url}`);