import { requireAuth } from '../utils/auth.js';

const userResolvers = {
  Query: {
    users: async (_, __, { prisma }) => {
      return prisma.user.findMany({
        orderBy: { id: 'desc' }
      });
    },

    user: async (_, { id }, { prisma }) => {
      return prisma.user.findUnique({
        where: { id: id }
      });
    },

    me: async (_, __, context) => {
      requireAuth(context);
      return context.user;
    },
  }
};

export default userResolvers;
