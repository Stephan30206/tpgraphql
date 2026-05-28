import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Nettoyage
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Password hash
  const password = await bcrypt.hash('password123', 10);

  // Users
  const alice = await prisma.user.create({
    data: {
      name: 'Alice Martin',
      email: 'alice@blog.com',
      password,
    }
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Dupont',
      email: 'bob@blog.com',
      password,
    }
  });

  // Posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Introduction à GraphQL',
      content: 'GraphQL est un langage de requête moderne.',
      published: true,
      authorId: alice.id,
    }
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Apollo Server Guide',
      content: 'Apollo Server simplifie GraphQL.',
      published: true,
      authorId: bob.id,
    }
  });

  // Comments
  await prisma.comment.create({
    data: {
      body: 'Excellent article !',
      authorId: bob.id,
      postId: post1.id,
    }
  });

  await prisma.comment.create({
    data: {
      body: 'Très intéressant.',
      authorId: alice.id,
      postId: post2.id,
    }
  });

  console.log('✅ Seed terminé avec succès');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());