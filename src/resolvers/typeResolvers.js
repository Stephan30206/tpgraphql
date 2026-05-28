/**
 * Type Resolvers — résolution des champs relationnels
 *
 * Ces resolvers s'exécutent quand GraphQL doit résoudre
 * un champ imbriqué (ex: post.author, user.posts, etc.)
 *
 * AVEC DataLoader (Bonus 2) : Post.author utilise le loader
 * pour éviter le problème N+1
 */
const typeResolvers = {
  User: {
    // User.posts → tous les articles de cet utilisateur
    posts: (parent, _, { prisma }) =>
      prisma.post.findMany({ where: { authorId: parent.id } }),

    // User.comments → tous les commentaires de cet utilisateur
    comments: (parent, _, { prisma }) =>
      prisma.comment.findMany({ where: { authorId: parent.id } }),
  },

  Post: {
    // Post.author — AVEC DataLoader (Bonus 2)
    // Sans DataLoader : prisma.user.findUnique({ where: { id: parent.authorId } })
    author: (parent, _, { loaders }) =>
      loaders.userLoader.load(parent.authorId),

    // Post.comments → tous les commentaires de cet article
    comments: (parent, _, { prisma }) =>
      prisma.comment.findMany({ where: { postId: parent.id } }),
  },

  Comment: {
    // Comment.author → auteur du commentaire
    author: (parent, _, { loaders }) =>
      loaders.userLoader.load(parent.authorId),

    // Comment.post → article commenté
    post: (parent, _, { prisma }) =>
      prisma.post.findUnique({ where: { id: parent.postId } }),
  },

  // Mutation.login — authentification
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