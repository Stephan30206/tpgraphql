import { requireAuth } from '../utils/auth.js';

const userResolvers = {
  Query: {
    /**
     * QUERY users — retourne tous les utilisateurs
     * Pas de protection : données publiques
     */
    users: async (_, __, { prisma }) => {
      return prisma.user.findMany({
        orderBy: { id: 'desc' }
      });
    },

    /**
     * QUERY user(id) — retourne un user par ID
     * Retourne null si introuvable (pas d'erreur)
     */
    user: async (_, { id }, { prisma }) => {
      return prisma.user.findUnique({
        where: { id: id }
      });
    },

    /**
     * QUERY me — retourne l'utilisateur connecté
     * Requiert un JWT valide dans le header
     */
    me: async (_, __, context) => {
      requireAuth(context);       // lance une erreur si non auth
      return context.user;         // déjà chargé dans le context
    },
  }
};

export default userResolvers;