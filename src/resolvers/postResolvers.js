import { requireAuth } from '../utils/auth.js';
import { GraphQLError } from 'graphql';

const postResolvers = {
  Query: {
    /**
     * QUERY posts — avec pagination optionnelle (Bonus 1)
     * Si page/limit non fournis, valeurs par défaut
     */
    posts: async (_, { page = 1, limit = 10 }, { prisma }) => {
      const skip = (page - 1) * limit; // offset
      const take = limit;

      const [data, total] = await Promise.all([
        prisma.post.findMany({
          where: { published: true },
          skip,
          take,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.post.count({ where: { published: true } })
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data,
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };
    },

    /**
     * QUERY post(id) — un article par ID
     */
    post: async (_, { id }, { prisma }) => {
      const post = await prisma.post.findUnique({ where: { id } });
      if (!post) {
        throw new GraphQLError(`Post ${id} introuvable`, {
          extensions: { code: 'NOT_FOUND' }
        });
      }
      return post;
    },
  },

  Mutation: {
    /**
     * MUTATION createPost — crée un article
     * Requiert JWT + assignation automatique de l'auteur
     */
    createPost: async (_, { input }, context) => {
      requireAuth(context);

      const { title, content, published = false } = input;

      // Validation basique
      if (!title?.trim()) {
        throw new GraphQLError('Le titre est obligatoire', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }
      if (!content?.trim()) {
        throw new GraphQLError('Le contenu est obligatoire', {
          extensions: { code: 'BAD_USER_INPUT' }
        });
      }

      return context.prisma.post.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          published,
          authorId: context.user.id, // depuis le JWT
        }
      });
    },

    /**
     * MUTATION updatePost — modifie un article
     * Vérifie que l'user est l'auteur
     */
    updatePost: async (_, { id, input }, context) => {
      requireAuth(context);

      const post = await context.prisma.post.findUnique({ where: { id } });
      if (!post) {
        throw new GraphQLError('Post introuvable', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      // Vérification du propriétaire
      if (post.authorId !== context.user.id) {
        throw new GraphQLError('Interdit : vous n\'êtes pas l\'auteur', {
          extensions: { code: 'FORBIDDEN', http: { status: 403 } }
        });
      }

      return context.prisma.post.update({
        where: { id },
        data: {
          // N'écrase que les champs fournis
          ...(input.title !== undefined && { title: input.title }),
          ...(input.content !== undefined && { content: input.content }),
          ...(input.published !== undefined && { published: input.published }),
        }
      });
    },

    /**
     * MUTATION deletePost — supprime un article
     * Retourne true si succès
     */
    deletePost: async (_, { id }, context) => {
      requireAuth(context);

      const post = await context.prisma.post.findUnique({ where: { id } });
      if (!post) {
        throw new GraphQLError('Post introuvable', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      if (post.authorId !== context.user.id) {
        throw new GraphQLError('Interdit : vous n\'êtes pas l\'auteur', {
          extensions: { code: 'FORBIDDEN' }
        });
      }

      // Supprimer les commentaires d'abord (contrainte FK)
      await context.prisma.comment.deleteMany({ where: { postId: id } });
      await context.prisma.post.delete({ where: { id } });

      return true;
    },
  }
};

export default postResolvers;