import { mergeResolvers } from '@graphql-tools/merge';
import userResolvers from './userResolvers.js';
import postResolvers from './postResolvers.js';
import typeResolvers from './typeResolvers.js';

// Fusionne proprement tous les resolvers
const resolvers = mergeResolvers([
  userResolvers,
  postResolvers,
  typeResolvers,
]);

export default resolvers;