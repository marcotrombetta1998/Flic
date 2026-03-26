import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client';
import { comments } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { deductCredits } from '../services/credits';

export async function commentRoutes(fastify: FastifyInstance) {
  fastify.get('/:videoId', async (request) => {
    const { videoId } = z.object({ videoId: z.string().uuid() }).parse(request.params);
    return db.select().from(comments).where(eq(comments.videoId, videoId)).orderBy(desc(comments.isPinned), desc(comments.createdAt)).limit(50);
  });

  fastify.post('/:videoId', { onRequest: [requireAuth] }, async (request, reply) => {
    const { videoId } = z.object({ videoId: z.string().uuid() }).parse(request.params);
    const { content, isPinned } = z.object({ content: z.string().max(80), isPinned: z.boolean().default(false) }).parse(request.body);
    const { id: userId } = request.user as { id: string };
    const creditsPaid = isPinned ? 1 : 0;
    if (isPinned) await deductCredits(userId, 1, 'query', videoId, { type: 'pinned_comment' });
    const [comment] = await db.insert(comments).values({ videoId, userId, content, isPinned, creditsPaid }).returning();
    return reply.code(201).send(comment);
  });

  fastify.delete('/:id', { onRequest: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    await db.delete(comments).where(eq(comments.id, id));
    return reply.code(204).send();
  });
}
