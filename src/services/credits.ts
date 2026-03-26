import { eq, desc, and } from 'drizzle-orm';
import { db } from '../db/client';
import { users, creditTransactions, creditPacks } from '../db/schema';
import { stripe } from '../lib/stripe';
import { createNotification } from './notifications';
import type { InferSelectModel } from 'drizzle-orm';

type CreditTxType = InferSelectModel<typeof creditTransactions>['type'];

export async function getBalance(userId: string): Promise<number> {
  const [user] = await db.select({ balance: users.creditsBalance }).from(users).where(eq(users.id, userId));
  return user?.balance ?? 0;
}

export async function deductCredits(
  userId: string,
  amount: number,
  type: CreditTxType,
  referenceId?: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await db.transaction(async (tx) => {
    const [user] = await tx.select({ balance: users.creditsBalance }).from(users).where(eq(users.id, userId));
    if (!user || user.balance < amount) {
      throw new Error('Insufficient credits');
    }
    await tx.update(users).set({ creditsBalance: user.balance - amount }).where(eq(users.id, userId));
    await tx.insert(creditTransactions).values({
      userId, amount: -amount, type,
      referenceId: referenceId ?? null,
      metadata,
    });
  });
}

export async function addCredits(
  userId: string,
  amount: number,
  type: CreditTxType,
  referenceId?: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  await db.transaction(async (tx) => {
    const [user] = await tx.select({ balance: users.creditsBalance }).from(users).where(eq(users.id, userId));
    const current = user?.balance ?? 0;
    await tx.update(users).set({ creditsBalance: current + amount, updatedAt: new Date() }).where(eq(users.id, userId));
    await tx.insert(creditTransactions).values({
      userId, amount, type,
      referenceId: referenceId ?? null,
      metadata,
    });
  });
}

export async function getTransactions(userId: string, limit = 20, cursor?: string) {
  const query = db
    .select()
    .from(creditTransactions)
    .where(eq(creditTransactions.userId, userId))
    .orderBy(desc(creditTransactions.createdAt))
    .limit(limit);
  return query;
}

export async function getPacks() {
  return db.select().from(creditPacks).where(eq(creditPacks.isActive, true));
}

export async function purchaseCredits(userId: string, packId: string) {
  const [pack] = await db.select().from(creditPacks).where(eq(creditPacks.id, packId));
  if (!pack) throw new Error('Pack not found');

  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));
  if (!user) throw new Error('User not found');

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(Number(pack.priceEur) * 100),
    currency: 'eur',
    metadata: { userId, packId, creditsBase: pack.creditsBase, creditsBonus: pack.creditsBonus },
    receipt_email: user.email,
    idempotency_key: `${userId}-${packId}-${Date.now()}`,
  });

  return { clientSecret: paymentIntent.client_secret, amount: Number(pack.priceEur) };
}

export async function fulfillCreditPurchase(paymentIntentId: string): Promise<void> {
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (pi.status !== 'succeeded') return;

  const { userId, packId, creditsBase, creditsBonus } = pi.metadata as Record<string, string>;
  const totalCredits = parseInt(creditsBase) + parseInt(creditsBonus);

  await addCredits(userId, totalCredits, 'purchase', packId, {
    stripePaymentId: paymentIntentId,
    pack: packId,
    baseCredits: parseInt(creditsBase),
    bonusCredits: parseInt(creditsBonus),
  });

  await createNotification(userId, 'earning', '⚡ Credits added!', `+${totalCredits} credits from your purchase.`, {});
}
