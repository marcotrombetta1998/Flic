import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client';
import { creators, users, videos } from '../db/schema';
import { requireAuth } from '../middleware/auth';

export async function creatorRoutes(fastify: FastifyInstance) {
  fastify.get('/leaderboard', async () => {
    return db
      .select({ creator: creators, user: users })
      .from(creators)
      .innerJoin(users, eq(creators.id, users.id))
      .orderBy(desc(creators.externalFollowers))
      .limit(20);
  });

  fastify.get('/discover', async () => {
    return db
      .select({ creator: creators, user: users })
      .from(creators)
      .innerJoin(users, eq(creators.id, users.id))
      .limit(10);
  });

  fastify.get('/:id', async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const [result] = await db
      .select({ creator: creators, user: users })
      .from(creators)
      .innerJoin(users, eq(creators.id, users.id))
      .where(eq(creators.id, id));
    if (!result) return reply.code(404).send({ error: 'Creator not found' });
    return result;
  });

  fastify.get('/:id/videos', async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    return db.select().from(videos).where(eq(videos.creatorId, id)).orderBy(desc(videos.publishedAt)).limit(30);
  });

  fastify.post('/:id/vote', { onRequest: [requireAuth] }, async (request) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    await db
      .update(creators)
      .set({ externalFollowers: (await db.select({ ef: creators.externalFollowers }).from(creators).where(eq(creators.id, id)))[0]!.ef + 1 })
      .where(eq(creators.id, id));
    return { ok: true };
  });
}
