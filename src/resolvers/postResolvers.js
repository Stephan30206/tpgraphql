import { requireAuth } from '../utils/auth.js';
import { GraphQLError } from 'graphql';

const postResolvers = {
  Query: {
    posts: async (_, { page = 1, limit = 10 }, { prisma }) => {
      const skip = (page - 1) * limit;
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
    createPost: async (_, { input }, context) => {
      requireAuth(context);

      const { title, content, published = false } = input;

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
          authorId: context.user.id,
        }
      });
    },

    updatePost: async (_, { id, input }, context) => {
      requireAuth(context);

      const post = await context.prisma.post.findUnique({ where: { id } });
      if (!post) {
        throw new GraphQLError('Post introuvable', {
          extensions: { code: 'NOT_FOUND' }
        });
      }

      if (post.authorId !== context.user.id) {
        throw new GraphQLError('Interdit : vous n\'êtes pas l\'auteur', {
          extensions: { code: 'FORBIDDEN', http: { status: 403 } }
        });
      }

      return context.prisma.post.update({
        where: { id },
        data: {
          ...(input.title !== undefined && { title: input.title }),
          ...(input.content !== undefined && { content: input.content }),
          ...(input.published !== undefined && { published: input.published }),
        }
      });
    },

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

      await context.prisma.comment.deleteMany({ where: { postId: id } });
      await context.prisma.post.delete({ where: { id } });

      return true;
    },
  }
};

export default postResolvers;
