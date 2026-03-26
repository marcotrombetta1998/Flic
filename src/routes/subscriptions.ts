import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db/client';
import { creatorSubscriptions, creators } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { deductCredits } from '../services/credits';

export async function subscriptionRoutes(fastify: FastifyInstance) {
  fastify.get('/', { onRequest: [requireAuth] }, async (request) => {
    const { id: userId } = request.user as { id: string };
    return db.select().from(creatorSubscriptions).where(and(eq(creatorSubscriptions.userId, userId), eq(creatorSubscriptions.status, 'active')));
  });

  fastify.post('/', { onRequest: [requireAuth] }, async (request, reply) => {
    const { creatorId, tierName } = z.object({ creatorId: z.string().uuid(), tierName: z.string() }).parse(request.body);
    const { id: userId } = request.user as { id: string };
    const [creator] = await db.select().from(creators).where(eq(creators.id, creatorId));
    if (!creator) return reply.code(404).send({ error: 'Creator not found' });
    const tiers = creator.subscriptionTiers as Array<{ name: string; creditsPerMonth: number }>;
    const tier = tiers.find((t) => t.name === tierName);
    if (!tier) return reply.code(404).send({ error: 'Tier not found' });
    await deductCredits(userId, tier.creditsPerMonth, 'subscription', creatorId);
    const nextMonth = new Date(); nextMonth.setMonth(nextMonth.getMonth() + 1);
    const [sub] = await db.insert(creatorSubscriptions).values({
      userId, creatorId, tierName, creditsPerMonth: tier.creditsPerMonth, currentPeriodEnd: nextMonth,
    }).returning();
    return reply.code(201).send(sub);
  });

  fastify.delete('/:id', { onRequest: [requireAuth] }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { id: userId } = request.user as { id: string };
    // HIGH-02: scope cancellation to the authenticated user's own subscriptions
    const result = await db
      .update(creatorSubscriptions)
      .set({ status: 'cancelled' })
      .where(and(eq(creatorSubscriptions.id, id), eq(creatorSubscriptions.userId, userId)))
      .returning({ id: creatorSubscriptions.id });
    if (result.length === 0) return reply.code(404).send({ error: 'Subscription not found' });
    return reply.code(204).send();
  });
}
