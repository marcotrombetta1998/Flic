import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { eq, and, lt } from 'drizzle-orm';
import { db } from '../db/client';
import { fanCards, userFanCards } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import { deductCredits, addCredits } from '../services/credits';

export async function fanCardRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => db.select().from(fanCards));

  fastify.get('/my-collection', { onRequest: [requireAuth] }, async (request) => {
    const { id: userId } = request.user as { id: string };
    return db
      .select({ userCard: userFanCards, card: fanCards })
      .from(userFanCards)
      .innerJoin(fanCards, eq(userFanCards.fanCardId, fanCards.id))
      .where(eq(userFanCards.userId, userId));
  });

  fastify.post('/:id/mint', { onRequest: [requireAuth] }, async (request, reply) => {
    const { id: cardId } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { id: userId } = request.user as { id: string };
    const [card] = await db.select().from(fanCards).where(eq(fanCards.id, cardId));
    if (!card) return reply.code(404).send({ error: 'Card not found' });

    // Atomic conditional increment — prevents oversell race condition
    const updated = await db
      .update(fanCards)
      .set({ minted: card.minted + 1 })
      .where(and(eq(fanCards.id, cardId), lt(fanCards.minted, fanCards.totalSupply)))
      .returning({ minted: fanCards.minted, totalSupply: fanCards.totalSupply });
    if (updated.length === 0) return reply.code(409).send({ error: 'Card sold out' });

    await deductCredits(userId, card.creditsCost, 'unlock', cardId);
    const serialNumber = updated[0]!.minted;
    const [userCard] = await db.insert(userFanCards).values({ userId, fanCardId: cardId, serialNumber }).returning();
    return reply.code(201).send(userCard);
  });

  fastify.post('/:id/sell', { onRequest: [requireAuth] }, async (request) => {
    const { id: cardId } = z.object({ id: z.string().uuid() }).parse(request.params);
    const { salePrice } = z.object({ salePrice: z.number().int().min(1) }).parse(request.body);
    const { id: userId } = request.user as { id: string };
    const [updated] = await db
      .update(userFanCards)
      .set({ isForSale: true, salePriceCredits: salePrice })
      .where(and(eq(userFanCards.userId, userId), eq(userFanCards.fanCardId, cardId)))
      .returning();
    return updated;
  });

  fastify.post('/:id/buy', { onRequest: [requireAuth] }, async (request, reply) => {
    const { id: cardId } = z.object({ id: z.string().uuid() }).parse(request.params);
    const buyerId = (request.user as { id: string }).id; // CRIT-03: never trust body for actor identity
    const [listing] = await db.select().from(userFanCards).where(and(eq(userFanCards.fanCardId, cardId), eq(userFanCards.isForSale, true)));
    if (!listing || !listing.salePriceCredits) return reply.code(404).send({ error: 'Listing not found' });
    if (listing.userId === buyerId) return reply.code(400).send({ error: 'Cannot buy your own listing' });
    await deductCredits(buyerId, listing.salePriceCredits, 'unlock', cardId);
    await addCredits(listing.userId, listing.salePriceCredits, 'creator_earning', cardId);
    const [updated] = await db
      .update(userFanCards)
      .set({ userId: buyerId, isForSale: false, salePriceCredits: null })
      .where(eq(userFanCards.id, listing.id))
      .returning();
    return updated;
  });
}
