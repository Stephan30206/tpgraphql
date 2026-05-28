import DataLoader from 'dataloader';

/**
 * createUserLoader — Factory qui crée un DataLoader par requête GraphQL.
 *
 * PROBLÈME N+1 résolu :
 *   Sans DataLoader : 10 posts → 10 requêtes SELECT user WHERE id = ?
 *   Avec DataLoader : 10 posts → 1 requête SELECT user WHERE id IN (...)
 *
 * Fonctionnement interne :
 *   1. Post.author appelle loader.load('userId_A')
 *   2. Post.author appelle loader.load('userId_B')
 *   ... (dans le même tick JavaScript)
 *   3. À la fin du tick, DataLoader déclenche batchFn(['userId_A', 'userId_B'])
 *   4. batchFn fait UNE seule requête SQL
 *   5. Les résultats sont distribués à chaque appel load() correspondant
 *
 * IMPORTANT : créer le loader PAR requête (dans context()), jamais en global,
 * sinon le cache persiste entre requêtes de différents utilisateurs.
 *
 * @param {import('@prisma/client').PrismaClient} prisma
 * @returns {DataLoader}
 */
export function createUserLoader(prisma) {
  return new DataLoader(
    async (userIds) => {
      // userIds = ex: ['id1', 'id2', 'id1', 'id3']
      // DataLoader déduplique automatiquement avant d'appeler cette fonction

      console.log(`[DataLoader] Batch : ${userIds.length} user(s) → 1 requête SQL`);

      // 1 seule requête SQL : WHERE id IN ('id1', 'id2', 'id3')
      const users = await prisma.user.findMany({
        where: { id: { in: [...new Set(userIds)] } },
      });

      // Construire une Map pour accès O(1) par ID
      const userMap = new Map(users.map((u) => [u.id, u]));

      // CRITIQUE : retourner dans le MÊME ordre que userIds reçus
      // DataLoader mappe résultat[i] → userIds[i]
      // Si l'ordre est incorrect → mauvais auteurs affichés !
      return userIds.map((id) => userMap.get(id) ?? null);
    },
    {
      cache: true,      // cache les résultats pour la durée de la requête
      maxBatchSize: 100, // ne batcher que 100 IDs max à la fois
    }
  );
}