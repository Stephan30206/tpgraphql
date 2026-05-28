import DataLoader from 'dataloader';

// DataLoader factory
export function createUserLoader(prisma) {
  return new DataLoader(
    async (userIds) => {
      console.log(`[DataLoader] Batch : ${userIds.length} user(s) → 1 SQL`);

      const users = await prisma.user.findMany({
        where: { id: { in: [...new Set(userIds)] } },
      });

      const userMap = new Map(users.map((u) => [u.id, u]));

      // Ordre critique
      return userIds.map((id) => userMap.get(id) ?? null);
    },
    {
      cache: true,
      maxBatchSize: 100,
    }
  );
}
