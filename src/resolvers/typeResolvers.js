// Type Resolvers
const typeResolvers = {
  User: {
    posts: (parent, _, { prisma }) =>
      prisma.post.findMany({ where: { authorId: parent.id } }),

    comments: (parent, _, { prisma }) =>
      prisma.comment.findMany({ where: { authorId: parent.id } }),
  },

  Post: {
    // DataLoader
    author: (parent, _, { loaders }) =>
      loaders.userLoader.load(parent.authorId),

    comments: (parent, _, { prisma }) =>
      prisma.comment.findMany({ where: { postId: parent.id } }),
  },

  Comment: {
    author: (parent, _, { loaders }) =>
      loaders.userLoader.load(parent.authorId),

    post: (parent, _, { prisma }) =>
      prisma.post.findUnique({ where: { id: parent.postId } }),
  },

  Mutation: {
    login: async (_, { email, password }, { prisma }) => {
      const { generateToken } = await import('../utils/auth.js');
      const bcrypt = await import('bcryptjs');
      const { GraphQLError } = await import('graphql');

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new GraphQLError('Identifiants invalides', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new GraphQLError('Identifiants invalides', {
          extensions: { code: 'UNAUTHENTICATED' }
        });
      }

      return { token: generateToken(user), user };
    },
  }
};

export default typeResolvers;
