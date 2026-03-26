import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../db/client';
import { cpaOffers, cpaEvents } from '../db/schema';

export async function matchCpaOffers(message: string, vertical: string) {
  const allOffers = await db
    .select()
    .from(cpaOffers)
    .where(and(eq(cpaOffers.isActive, true)));

  const msgLower = message.toLowerCase();
  return allOffers.filter((offer) => {
    const verticalMatch = offer.verticals.length === 0 || offer.verticals.includes(vertical);
    const keywordMatch = offer.triggerKeywords.some((kw) => msgLower.includes(kw.toLowerCase()));
    const hasBudget = Number(offer.budgetRemainingEur) > 0;
    return verticalMatch && keywordMatch && hasBudget;
  });
}

export function shouldShowOffer(offersShown: number, totalMessages: number): boolean {
  if (totalMessages < 3) return false;
  if (offersShown === 0) return totalMessages >= 3;
  return totalMessages % 5 === 0;
}

export async function logCpaEvent(
  offerId: string,
  userId: string,
  videoId: string,
  conversationId: string,
  eventType: 'shown' | 'clicked' | 'converted'
) {
  await db.insert(cpaEvents).values({ offerId, userId, videoId, conversationId, eventType });
}
