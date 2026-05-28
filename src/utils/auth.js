import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Auth protection
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
