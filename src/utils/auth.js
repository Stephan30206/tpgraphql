import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

/**
 * Génère un JWT contenant l'userId et l'email
 * @param {Object} user - { id, email }
 * @returns {string} token JWT signé
 */
export function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },  // payload
    process.env.JWT_SECRET,                   // clé secrète
    { expiresIn: process.env.JWT_EXPIRES_IN } // expiration
  );
}

/**
 * Vérifie et décode un JWT
 * @param {string} token - le Bearer token
 * @returns {Object} payload décodé { userId, email }
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    // Token expiré ou invalide
    return null;
  }
}

/**
 * Middleware de protection des resolvers
 * Lance une GraphQLError si l'user n'est pas authentifié
 */
export function requireAuth(context) {
  if (!context.user) {
    throw new GraphQLError('Non authentifié. Fournissez un token Bearer valide.', {
      extensions: {
        code: 'UNAUTHENTICATED',
        http: { status: 401 }
      }
    });
  }
}