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

  // Mobile PaymentSheet: create PaymentIntent + ephemeral key for Apple Pay / Google Pay
  fastify.post('/payment-intent', { onRequest: [requireAuth] }, async (request, reply) => {
    const { packId } = z.object({ packId: z.string().uuid() }).parse(request.body);
    const { id: userId, email } = request.user as { id: string; email: string };

    const packs = await getPacks();
    const pack = packs.find((p) => p.id === packId);
    if (!pack) return reply.code(404).send({ error: 'Pack not found' });

    // Get or create Stripe customer
    let customerId: string;
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      customerId = existing.data[0]!.id;
    } else {
      const customer = await stripe.customers.create({ email, metadata: { userId } });
      customerId = customer.id;
    }

    // Ephemeral key for PaymentSheet
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customerId },
      { apiVersion: '2024-06-20' }
    );

    // PaymentIntent in EUR cents
    const amountCents = Math.round(parseFloat(pack.priceEur as string) * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'eur',
      customer: customerId,
      metadata: { userId, packId },
      automatic_payment_methods: { enabled: true },
    });

    return {
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customerId,
    };
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
