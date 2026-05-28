import { verifyToken } from '../utils/auth.js';
import prisma from '../models/db.js';
import { createUserLoader } from '../loaders/userLoader.js';

/**
 * La fonction context() est appelée à CHAQUE requête GraphQL.
 * Elle reçoit l'objet { req } HTTP et retourne le contexte
 * qui sera disponible dans TOUS les resolvers.
 *
 * Contexte contient :
 *  - prisma     : accès à la base de données
 *  - user       : utilisateur connecté (null si non auth)
 *  - loaders    : DataLoaders pour éviter N+1
 */
export async function context({ req }) {
  // 1. Extraire le token de l'en-tête Authorization
  const authHeader = req.headers?.authorization || '';

  // Format attendu : "Bearer eyJhbGciOiJIUzI1NiJ9..."
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  // 2. Vérifier et décoder le token
  let user = null;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      // 3. Charger l'utilisateur depuis la DB
      user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
    }
  }

  // 4. Retourner le contexte enrichi
  return {
    prisma,
    user,
    loaders: {
      // DataLoader créé PAR requête (pas global)
      userLoader: createUserLoader(prisma),
    }
  };
}