import { verifyToken } from '../utils/auth.js';
import prisma from '../models/db.js';
import { createUserLoader } from '../loaders/userLoader.js';

// Contexte par requête
export async function context({ req }) {
  const authHeader = req.headers?.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  let user = null;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
    }
  }

  return {
    prisma,
    user,
    loaders: {
      userLoader: createUserLoader(prisma),
    }
  };
}
