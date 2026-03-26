import { db } from '../../db/client';
import { spinResults, creditTransactions } from '../../db/schema';
import { addCredits } from '../credits';

interface SpinPrize {
  type: 'multiplier' | 'bonus_credits' | 'mystery_drop' | 'free_query';
  value: number | null;
  weight: number;
  label: string;
}

const SPIN_PRIZES: SpinPrize[] = [
  { type: 'multiplier',    value: 1.5,  weight: 30, label: '1.5× Credits!' },
  { type: 'multiplier',    value: 2.0,  weight: 20, label: '2× Credits!' },
  { type: 'multiplier',    value: 3.0,  weight: 5,  label: '3× Credits! 🔥' },
  { type: 'bonus_credits', value: 10,   weight: 25, label: '+10 Bonus Credits' },
  { type: 'bonus_credits', value: 25,   weight: 10, label: '+25 Bonus Credits' },
  { type: 'mystery_drop',  value: null, weight: 7,  label: 'Mystery Drop! 🎁' },
  { type: 'free_query',    value: 5,    weight: 3,  label: '5 Free FLICs! ⚡' },
];

function weightedRandom(prizes: SpinPrize[]): SpinPrize {
  const total = prizes.reduce((sum, p) => sum + p.weight, 0);
  let rand = Math.random() * total;
  for (const prize of prizes) {
    rand -= prize.weight;
    if (rand <= 0) return prize;
  }
  return prizes[prizes.length - 1]!;
}

export async function executeSpin(
  userId: string,
  purchasedCredits: number,
  transactionId: string
): Promise<{ prize: SpinPrize; creditsAwarded: number; label: string }> {
  const prize = weightedRandom(SPIN_PRIZES);
  let creditsAwarded = 0;

  if (prize.type === 'multiplier' && prize.value) {
    const bonus = Math.floor(purchasedCredits * (prize.value - 1));
    creditsAwarded = bonus;
    await addCredits(userId, bonus, 'spin_bonus', transactionId, { multiplier: prize.value });
  } else if (prize.type === 'bonus_credits' && prize.value) {
    creditsAwarded = prize.value;
    await addCredits(userId, prize.value, 'spin_bonus', transactionId, {});
  } else if (prize.type === 'free_query' && prize.value) {
    creditsAwarded = prize.value;
    await addCredits(userId, prize.value, 'reward', transactionId, { source: 'spin_free_query' });
  }

  await db.insert(spinResults).values({
    userId,
    transactionId,
    prizeType: prize.type,
    prizeValue: { value: prize.value, label: prize.label, creditsAwarded },
  });

  return { prize, creditsAwarded, label: prize.label };
}
