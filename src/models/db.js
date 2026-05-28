import { PrismaClient } from '@prisma/client';

// Singleton Prisma Client
// Évite plusieurs connexions Prisma en développement avec Nodemon

const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
