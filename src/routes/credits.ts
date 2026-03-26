import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { getBalance, getTransactions, getPacks, purchaseCredits, fulfillCreditPurchase } from '../services/credits';
import { executeSpin } from '../services/gamification/spin-wheel';
import { purchaseMysteryDrop } from '../services/gamification/mystery-drop';
import { stripe } from '../lib/stripe';
import type Stripe from 'stripe';

export async function creditRoutes(fastify: FastifyInstance) {
  fastify.get('/balance', { onRequest: [requireAuth] }, async (request) => {
    const { id } = request.user as { id: string };
    const balance = await getBalance(id);
    return { balance };
  });

  fastify.get('/packs', async () => getPacks());

  fastify.post('/purchase', { onRequest: [requireAuth] }, async (request, reply) => {
    const { packId } = z.object({ packId: z.string().uuid() }).parse(request.body);
    const { id } = request.user as { id: string };
    const result = await purchaseCredits(id, packId);
    return result;
  });

  fastify.post('/webhook/stripe', {
    config: { rawBody: true },
  }, async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        (request as { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(request.body)),
        sig,
        process.env.STRIPE_WEBHOOK_SECRET ?? ''
      );
    } catch {
      return reply.code(400).send({ error: 'Invalid signature' });
    }
    if (event.type === 'payment_intent.succeeded') {
      const pi = event.data.object as Stripe.PaymentIntent;
      await fulfillCreditPurchase(pi.id);
    }
    return { received: true };
  });

  fastify.get('/transactions', { onRequest: [requireAuth] }, async (request) => {
    const { id } = request.user as { id: string };
    const { limit } = z.object({ limit: z.coerce.number().default(20) }).parse(request.query);
    return getTransactions(id, limit);
  });

  fastify.post('/spin', { onRequest: [requireAuth] }, async (request) => {
    const { transactionId, purchasedCredits } = z.object({
      transactionId: z.string().uuid(),
      purchasedCredits: z.number().int().positive(),
    }).parse(request.body);
    const { id } = request.user as { id: string };
    return executeSpin(id, purchasedCredits, transactionId);
  });

  fastify.post('/mystery-drop', { onRequest: [requireAuth] }, async (request) => {
    const { id } = request.user as { id: string };
    return purchaseMysteryDrop(id);
  });
}
